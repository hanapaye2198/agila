import { createServer } from "node:http";
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { extname, resolve } from "node:path";

const scrypt = promisify(scryptCallback);
const dataFile = process.env.DATA_FILE ?? fileURLToPath(new URL("./data.json", import.meta.url));
const distDirectory = fileURLToPath(new URL("../dist/", import.meta.url));
const port = Number(process.env.PORT ?? 3000);
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173,http://127.0.0.1:5173,https://localhost,capacitor://localhost").split(",").map((origin) => origin.trim()).filter(Boolean);
const isProduction = process.env.NODE_ENV === "production";
const seedDemoAccount = !isProduction || process.env.SEED_DEMO_ACCOUNT === "true";
const exposeResetToken = !isProduction && process.env.EXPOSE_RESET_TOKEN === "true";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contentTypes = { ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".ico": "image/x-icon", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };

class RequestError extends Error {
  constructor(message, status = 400, code = "BAD_REQUEST") {
    super(message);
    this.status = status;
    this.code = code;
  }
}
const sessionLifetime = 8 * 60 * 60 * 1000;
const rememberedSessionLifetime = 30 * 24 * 60 * 60 * 1000;
const scannerSessionLifetime = 12 * 60 * 60 * 1000;
const maxBodyBytes = 1_000_000;
const duplicateScanWindow = 30_000;
const resetTokens = new Map();
const loginAttempts = new Map();
const resetAttempts = new Map();
const registerAttempts = new Map();
const sessions = new Map();
const users = new Map();
const workspaces = new Map();
const scannerSessions = new Map();
const scans = [];
const notifications = [];
const reports = [];
const workspaceSettings = new Map();
const learners = new Map([
  ["NG-24-0117", { id: "NG-24-0117", name: "Althea Marquez", gradeLevel: "Grade 11", section: "Sampaguita", guardian: "Rowena Marquez", guardianPhone: "+63 917 224 8890", status: "present", rate: 97.4, lastScan: "6:52 AM" }],
  ["NG-24-0132", { id: "NG-24-0132", name: "Jomar Villanueva", gradeLevel: "Grade 12", section: "Narra", guardian: "Elias Villanueva", guardianPhone: "+63 918 776 1203", status: "late", rate: 88.1, lastScan: "7:41 AM" }],
  ["NG-24-0145", { id: "NG-24-0145", name: "Bianca Solano", gradeLevel: "Grade 9", section: "Molave", guardian: "Cristina Solano", guardianPhone: "+63 926 330 5512", status: "present", rate: 99.1, lastScan: "6:38 AM" }],
]);
const teachers = new Map([
  ["T-1042", { id: "T-1042", name: "Ma. Lourdes Aquino", email: "l.aquino@northgate.edu.ph", department: "Mathematics", advisory: "Grade 11 - Sampaguita", classes: 6, status: "active" }],
  ["T-1055", { id: "T-1055", name: "Ferdinand Cruz", email: "f.cruz@northgate.edu.ph", department: "Science", advisory: "Grade 9 - Molave", classes: 5, status: "active" }],
  ["T-1063", { id: "T-1063", name: "Grace Palomar", email: "g.palomar@northgate.edu.ph", department: "English", advisory: "Grade 8 - Ilang-Ilang", classes: 7, status: "on leave" }],
  ["T-1071", { id: "T-1071", name: "Noel Santiago", email: "n.santiago@northgate.edu.ph", department: "Values Education", advisory: "Grade 12 - Narra", classes: 4, status: "active" }],
]);

const devices = [
  { id: "NG-SCN-01", gate: "Main Gate", online: true },
  { id: "NG-SCN-02", gate: "East Gate", online: true },
  { id: "NG-SCN-03", gate: "Annex Gate", online: true },
  { id: "NG-SCN-04", gate: "Gym Entrance", online: false },
];

for (const learner of learners.values()) learner.workspaceId = "demo-workspace";
for (const teacher of teachers.values()) teacher.workspaceId = "demo-workspace";

async function loadData() {
  try {
    const saved = JSON.parse(await readFile(dataFile, "utf8"));
    for (const user of saved.users ?? []) users.set(user.id, user);
    for (const workspace of saved.workspaces ?? []) workspaces.set(workspace.id, workspace);
    for (const scan of saved.scans ?? []) scans.push(scan);
    for (const learner of saved.learners ?? []) learners.set(`${learner.workspaceId ?? "demo-workspace"}:${learner.id}`, { ...learner, workspaceId: learner.workspaceId ?? "demo-workspace" });
    for (const teacher of saved.teachers ?? []) teachers.set(`${teacher.workspaceId ?? "demo-workspace"}:${teacher.id}`, { ...teacher, workspaceId: teacher.workspaceId ?? "demo-workspace" });
    for (const notification of saved.notifications ?? []) notifications.push(notification);
    for (const report of saved.reports ?? []) reports.push(report);
    for (const setting of saved.workspaceSettings ?? []) workspaceSettings.set(setting.workspaceId, setting);
    for (const user of users.values()) {
      user.workspaceId ??= "demo-workspace";
      if (!workspaces.has(user.workspaceId)) workspaces.set(user.workspaceId, { id: user.workspaceId, name: user.schoolName ?? "AGILA workspace" });
    }
    for (const learner of learners.values()) learner.workspaceId ??= "demo-workspace";
    for (const teacher of teachers.values()) teacher.workspaceId ??= "demo-workspace";
    for (const scan of scans) scan.workspaceId ??= "demo-workspace";
  } catch (error) {
    if (error.code !== "ENOENT") console.warn(`Unable to load ${dataFile}: ${error.message}`);
  }
}

let savePending = Promise.resolve();

function saveData() {
  savePending = savePending.then(async () => {
    const temporaryFile = `${dataFile}.${randomBytes(6).toString("hex")}.tmp`;
    await writeFile(temporaryFile, JSON.stringify({ users: [...users.values()], workspaces: [...workspaces.values()], scans, learners: [...learners.values()], teachers: [...teachers.values()], notifications, reports, workspaceSettings: [...workspaceSettings.values()] }, null, 2), "utf8");
    await rename(temporaryFile, dataFile);
  }, () => {});
  return savePending;
}

function send(response, status, body, headers = {}) {
  const payload = body === undefined ? "" : JSON.stringify(body);
  response.writeHead(status, {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    ...(response.agilaCorsOrigin ? { "Access-Control-Allow-Origin": response.agilaCorsOrigin, Vary: "Origin" } : {}),
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  response.end(payload);
}

function fail(response, status, message, code = "REQUEST_FAILED", details, headers) {
  send(response, status, { message, code, ...(details === undefined ? {} : { details }) }, headers);
}

async function serveClient(request, response, pathname) {
  if (!["GET", "HEAD"].includes(request.method)) return fail(response, 405, "Method not allowed", "METHOD_NOT_ALLOWED");
  const requested = pathname === "/" ? "index.html" : pathname.slice(1);
  const candidate = resolve(distDirectory, requested);
  const isAsset = extname(requested) !== "";
  const file = candidate.startsWith(resolve(distDirectory)) && isAsset ? candidate : resolve(distDirectory, "index.html");
  try {
    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": contentTypes[extname(file)] ?? "application/octet-stream", "Cache-Control": file.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable" });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Client build not found. Run npm run build before starting the server.");
  }
}

function clearSessionCookie() {
  const secure = isProduction ? "; Secure" : "";
  return `agila_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie ?? "").split(";").filter(Boolean).map((part) => {
    const index = part.indexOf("=");
    if (index < 0) return [part.trim(), ""];
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }));
}

function getSession(request) {
  const cookies = parseCookies(request);
  const bearer = request.headers.authorization?.startsWith("Bearer ")
    ? request.headers.authorization.slice(7)
    : undefined;
  const token = bearer ?? cookies.agila_session;
  const session = token ? sessions.get(token) : undefined;
  if (session && session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return undefined;
  }
  return session;
}

function requireSession(request, response) {
  const session = getSession(request);
  if (!session) {
    fail(response, 401, "Authentication required", "AUTH_REQUIRED", undefined, { "Set-Cookie": clearSessionCookie() });
    return undefined;
  }
  const user = users.get(session.userId);
  if (!user) {
    fail(response, 401, "Session is no longer valid", "SESSION_INVALID", undefined, { "Set-Cookie": clearSessionCookie() });
    return undefined;
  }
  return user;
}

async function readJson(request) {
  const declaredLength = Number(request.headers["content-length"] ?? 0);
  if (declaredLength > maxBodyBytes) throw new RequestError("Request body is too large", 413, "BODY_TOO_LARGE");
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) throw new RequestError("Request body is too large", 413, "BODY_TOO_LARGE");
    chunks.push(chunk);
  }
  if (!size) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  let parsed;
  try { parsed = JSON.parse(raw); } catch { throw new RequestError("Invalid JSON body", 400, "INVALID_JSON"); }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new RequestError("Request body must be a JSON object", 400, "INVALID_JSON");
  }
  return parsed;
}

async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${Buffer.from(derived).toString("hex")}`;
}

async function verifyPassword(password, stored) {
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  try {
    const actual = Buffer.from(await hashPassword(password, salt).then((value) => value.split(":")[1]), "hex");
    const expected = Buffer.from(expectedHex, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, schoolName: user.schoolName };
}

function workspaceIdFor(user) { return user.workspaceId; }
function inWorkspace(items, user) { return [...items].filter((item) => item.workspaceId === workspaceIdFor(user)); }
function findLearner(user, id) { return inWorkspace(learners.values(), user).find((learner) => learner.id === id); }
function requireRole(user, response, roles) {
  if (!roles.includes(user.role)) { fail(response, 403, "You do not have permission to perform this action", "FORBIDDEN"); return false; }
  return true;
}

function defaultSettings(user) {
  return workspaceSettings.get(workspaceIdFor(user)) ?? {
    workspaceId: workspaceIdFor(user), schoolName: user.schoolName, schoolYear: "2026–2027", timezone: "Asia/Manila", classStart: "07:00", lateCutoff: "07:15", absentCutoff: "08:00", dismissal: "16:30",
    channels: { sms: true, push: true, email: true, adviser: false },
  };
}

function sessionCookie(token, remember) {
  const secure = isProduction ? "; Secure" : "";
  const maxAge = remember ? `; Max-Age=${Math.floor(rememberedSessionLifetime / 1000)}` : "";
  return `agila_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure}${maxAge}`;
}

function createSession(userId, remember) {
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  sessions.set(token, {
    userId,
    createdAt: now,
    expiresAt: now + (remember ? rememberedSessionLifetime : sessionLifetime),
  });
  return token;
}

function revokeUserSessions(userId) {
  for (const [token, session] of sessions) if (session.userId === userId) sessions.delete(token);
  for (const [token, session] of scannerSessions) if (session.userId === userId) scannerSessions.delete(token);
  for (const [token, reset] of resetTokens) if (reset.userId === userId) resetTokens.delete(token);
}

function isRateLimited(request, attempts = loginAttempts, limit = 10) {
  const key = request.socket.remoteAddress ?? "unknown";
  const now = Date.now();
  const entry = attempts.get(key) ?? { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (entry.resetAt <= now) { entry.count = 0; entry.resetAt = now + 15 * 60 * 1000; }
  entry.count += 1;
  attempts.set(key, entry);
  return entry.count > limit;
}

async function createUser({ name, email, password, phone, schoolName, schoolType, enrollmentSize }) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const normalizedName = String(name ?? "").trim();
  const normalizedSchool = String(schoolName ?? "").trim();
  if (!normalizedName || !normalizedEmail || typeof password !== "string" || !normalizedSchool) {
    throw new RequestError("Name, email, password, and school are required", 400, "REGISTRATION_INVALID");
  }
  if (!emailPattern.test(normalizedEmail)) throw new RequestError("Enter a valid email address", 400, "REGISTRATION_INVALID");
  if (password.length < 10) throw new RequestError("Password must be at least 10 characters", 400, "REGISTRATION_INVALID");
  if (usersByEmail(normalizedEmail)) throw new RequestError("An account with this email already exists", 409, "EMAIL_TAKEN");
  const workspaceId = randomUUID();
  const user = {
    id: randomUUID(),
    name: normalizedName,
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    phone: typeof phone === "string" ? phone.trim() : undefined,
    schoolName: normalizedSchool,
    schoolType: typeof schoolType === "string" ? schoolType : undefined,
    enrollmentSize: typeof enrollmentSize === "string" ? enrollmentSize : undefined,
    role: "School Administrator",
    workspaceId,
  };
  workspaces.set(workspaceId, { id: workspaceId, name: normalizedSchool, createdAt: Date.now() });
  workspaceSettings.set(workspaceId, defaultSettings(user));
  users.set(user.id, user);
  await saveData();
  return user;
}

function usersByEmail(email) {
  return [...users.values()].find((user) => user.email === email);
}

async function handle(request, response) {
  const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);
  const origin = request.headers.origin;
  const sameOrigin = origin === `${url.protocol}//${request.headers.host}`;
  if (origin && !sameOrigin && !allowedOrigins.includes(origin)) return fail(response, 403, "Origin is not allowed", "ORIGIN_FORBIDDEN");
  if (origin && allowedOrigins.includes(origin)) response.agilaCorsOrigin = origin;
  if (request.method === "OPTIONS") return send(response, 204);
  if (!url.pathname.startsWith("/api")) return serveClient(request, response, url.pathname);
  const path = url.pathname.replace(/^\/api(?=\/|$)/, "") || "/";

  try {
    if (request.method === "GET" && path === "/health") {
      return send(response, 200, { status: "ok", service: "agila-api", uptimeSeconds: Math.floor(process.uptime()) });
    }

    if (request.method === "POST" && path === "/auth/login") {
      if (isRateLimited(request)) return fail(response, 429, "Too many login attempts", "RATE_LIMITED");
      const body = await readJson(request);
      const user = usersByEmail(String(body.email ?? "").trim().toLowerCase());
      if (!user || !(await verifyPassword(String(body.password ?? ""), user.passwordHash))) return fail(response, 401, "Invalid email or password", "INVALID_CREDENTIALS");
      loginAttempts.delete(request.socket.remoteAddress ?? "unknown");
      const token = createSession(user.id, body.remember === true);
      return send(response, 200, { user: publicUser(user) }, { "Set-Cookie": sessionCookie(token, body.remember === true) });
    }

    if (request.method === "POST" && path === "/auth/register") {
      if (isRateLimited(request, registerAttempts, 5)) return fail(response, 429, "Too many registration attempts", "RATE_LIMITED");
      const body = await readJson(request);
      const user = await createUser(body);
      const token = createSession(user.id, false);
      return send(response, 201, { user: publicUser(user) }, { "Set-Cookie": sessionCookie(token, false) });
    }

    if (request.method === "GET" && path === "/auth/me") {
      const user = requireSession(request, response);
      return user ? send(response, 200, { user: publicUser(user) }) : undefined;
    }

    if (request.method === "POST" && path === "/auth/logout") {
      const cookies = parseCookies(request);
      const bearer = request.headers.authorization?.startsWith("Bearer ") ? request.headers.authorization.slice(7) : undefined;
      sessions.delete(bearer ?? cookies.agila_session);
      return send(response, 204, undefined, { "Set-Cookie": clearSessionCookie() });
    }

    if (request.method === "POST" && path === "/auth/forgot-password") {
      if (isRateLimited(request, resetAttempts, 5)) return fail(response, 429, "Too many reset requests", "RATE_LIMITED");
      const body = await readJson(request);
      const user = usersByEmail(String(body.email ?? "").trim().toLowerCase());
      const resetToken = user ? randomBytes(32).toString("hex") : undefined;
      if (resetToken) resetTokens.set(resetToken, { userId: user.id, expiresAt: Date.now() + 30 * 60 * 1000 });
      return send(response, 202, {
        message: "If the email is registered, a reset link has been sent.",
        ...(exposeResetToken && resetToken ? { resetToken } : {}),
      });
    }

    if (request.method === "POST" && path === "/auth/reset-password") {
      const body = await readJson(request);
      const reset = typeof body.token === "string" ? resetTokens.get(body.token) : undefined;
      if (!reset || reset.expiresAt <= Date.now()) {
        if (reset) resetTokens.delete(body.token);
        return fail(response, 400, "Reset link is invalid or expired", "RESET_INVALID");
      }
      if (typeof body.password !== "string" || body.password.length < 10) return fail(response, 400, "Password must be at least 10 characters", "PASSWORD_INVALID");
      const user = users.get(reset.userId);
      if (!user) {
        resetTokens.delete(body.token);
        return fail(response, 400, "Account no longer exists", "ACCOUNT_INVALID");
      }
      user.passwordHash = await hashPassword(body.password);
      revokeUserSessions(user.id);
      await saveData();
      return send(response, 204, undefined, { "Set-Cookie": clearSessionCookie() });
    }

    if (request.method === "GET" && path === "/dashboard/summary") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const learnerList = inWorkspace(learners.values(), user);
      const todayScans = scans.filter((scan) => scan.workspaceId === workspaceIdFor(user) && scan.createdAt >= todayStart.getTime());
      const presentIds = new Set(todayScans.filter((scan) => scan.status === "present").map((scan) => scan.identifier));
      const statusSplit = ["present", "late", "absent", "excused"].map((status) => ({ name: status[0].toUpperCase() + status.slice(1), key: status, value: status === "present" || status === "late" ? todayScans.filter((scan) => scan.status === status).length : learnerList.filter((learner) => !presentIds.has(learner.id) && learner.status === status).length }));
      const recent = scans.filter((scan) => scan.workspaceId === workspaceIdFor(user)).slice(-8).reverse().map((scan) => ({ id: scan.id, student: scan.student, gradeSection: scan.gradeSection, timeIn: scan.timeIn, status: scan.status, gate: scan.gate, guardianNotified: scan.guardianNotified }));
      const weekly = Array.from({ length: 5 }, (_, index) => {
        const day = new Date(todayStart); day.setDate(day.getDate() - (4 - index));
        const dayEnd = new Date(day); dayEnd.setDate(dayEnd.getDate() + 1);
        const dayScans = scans.filter((scan) => scan.workspaceId === workspaceIdFor(user) && scan.createdAt >= day.getTime() && scan.createdAt < dayEnd.getTime());
        return { day: day.toLocaleDateString("en-US", { weekday: "short" }), present: dayScans.filter((scan) => scan.status === "present").length, late: dayScans.filter((scan) => scan.status === "late").length, absent: Math.max(0, learnerList.length - new Set(dayScans.map((scan) => scan.identifier)).size) };
      });
      const gradeBreakdown = [...new Set(learnerList.map((learner) => learner.gradeLevel))].map((grade) => { const group = learnerList.filter((learner) => learner.gradeLevel === grade); return { grade, rate: Number((group.reduce((sum, learner) => sum + learner.rate, 0) / Math.max(1, group.length)).toFixed(1)) }; });
      return send(response, 200, { stats: { enrolled: learnerList.length, present: statusSplit.find((item) => item.key === "present")?.value ?? 0, late: statusSplit.find((item) => item.key === "late")?.value ?? 0, guardiansNotified: todayScans.filter((scan) => scan.guardianNotified).length, guardianReach: learnerList.length ? Math.round(learnerList.filter((learner) => learner.guardian).length / learnerList.length * 1000) / 10 : 0 }, weekly, statusSplit, gradeBreakdown, recent });
    }

    if (request.method === "GET" && path === "/students") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      const query = (url.searchParams.get("query") ?? "").trim().toLowerCase();
      const grade = url.searchParams.get("grade") ?? "";
      const status = (url.searchParams.get("status") ?? "").toLowerCase();
      const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
      const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 8)));
      const filtered = inWorkspace(learners.values(), user).filter((learner) => {
        const searchable = `${learner.id} ${learner.name} ${learner.guardian}`.toLowerCase();
        return (!query || searchable.includes(query)) && (!grade || learner.gradeLevel === grade) && (!status || learner.status === status);
      });
      const start = (page - 1) * pageSize;
      return send(response, 200, {
        students: filtered.slice(start, start + pageSize),
        total: filtered.length,
        hasMore: start + pageSize < filtered.length,
        stats: { enrolled: inWorkspace(learners.values(), user).length, guardiansLinked: inWorkspace(learners.values(), user).filter((item) => item.guardian).length },
      });
    }

    if (request.method === "POST" && path === "/students") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      if (!requireRole(user, response, ["School Administrator", "Registrar"])) return undefined;
      const body = await readJson(request);
      const id = String(body.id ?? "").trim().toUpperCase();
      const name = String(body.name ?? "").trim();
      const gradeLevel = String(body.gradeLevel ?? "").trim();
      const section = String(body.section ?? "").trim();
      if (!id || !name || !gradeLevel || !section) throw new RequestError("ID, name, grade, and section are required", 400, "STUDENT_INVALID");
      if (findLearner(user, id)) throw new RequestError("A learner with this ID already exists", 409, "STUDENT_EXISTS");
      const learner = { id, workspaceId: workspaceIdFor(user), name, gradeLevel, section, guardian: String(body.guardian ?? "").trim(), guardianPhone: String(body.guardianPhone ?? "").trim(), status: "absent", rate: 0, lastScan: "—" };
      learners.set(`${workspaceIdFor(user)}:${id}`, learner);
      await saveData();
      return send(response, 201, { student: learner });
    }

    if (request.method === "POST" && path === "/students/import") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      if (!requireRole(user, response, ["School Administrator", "Registrar"])) return undefined;
      const body = await readJson(request);
      if (!Array.isArray(body.students) || body.students.length > 500) throw new RequestError("Import must contain up to 500 students", 400, "IMPORT_INVALID");
      let imported = 0;
      for (const item of body.students) {
        const id = String(item.id ?? "").trim().toUpperCase();
        const name = String(item.name ?? "").trim();
        const gradeLevel = String(item.gradeLevel ?? "").trim();
        const section = String(item.section ?? "").trim();
        if (!id || !name || !gradeLevel || !section || findLearner(user, id)) continue;
        learners.set(`${workspaceIdFor(user)}:${id}`, { id, workspaceId: workspaceIdFor(user), name, gradeLevel, section, guardian: String(item.guardian ?? "").trim(), guardianPhone: String(item.guardianPhone ?? "").trim(), status: "absent", rate: 0, lastScan: "—" });
        imported += 1;
      }
      await saveData();
      return send(response, 200, { imported, total: inWorkspace(learners.values(), user).length });
    }

    if (request.method === "GET" && path === "/teachers") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      const query = (url.searchParams.get("query") ?? "").trim().toLowerCase();
      const result = inWorkspace(teachers.values(), user).filter((teacher) => !query || `${teacher.name} ${teacher.email} ${teacher.department}`.toLowerCase().includes(query));
      return send(response, 200, { teachers: result, total: result.length, stats: { faculty: inWorkspace(teachers.values(), user).length, advisers: inWorkspace(teachers.values(), user).filter((item) => item.advisory).length } });
    }

    if (request.method === "POST" && path === "/teachers") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      if (!requireRole(user, response, ["School Administrator"])) return undefined;
      const body = await readJson(request);
      const name = String(body.name ?? "").trim();
      const email = String(body.email ?? "").trim().toLowerCase();
      const department = String(body.department ?? "").trim();
      if (!name || !email || !department || !emailPattern.test(email)) throw new RequestError("Name, valid email, and department are required", 400, "TEACHER_INVALID");
      if (inWorkspace(teachers.values(), user).some((teacher) => teacher.email === email)) throw new RequestError("A teacher with this email already exists", 409, "TEACHER_EXISTS");
      const teacher = { id: `T-${randomBytes(3).toString("hex").toUpperCase()}`, workspaceId: workspaceIdFor(user), name, email, department, advisory: String(body.advisory ?? "").trim(), classes: 0, status: "active" };
      teachers.set(`${workspaceIdFor(user)}:${teacher.id}`, teacher);
      await saveData();
      return send(response, 201, { teacher });
    }

    if (request.method === "POST" && path === "/teachers/invite") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      if (!requireRole(user, response, ["School Administrator"])) return undefined;
      const body = await readJson(request);
      const email = String(body.email ?? "").trim().toLowerCase();
      if (!emailPattern.test(email)) throw new RequestError("Enter a valid faculty email", 400, "INVITE_INVALID");
      notifications.push({ id: randomUUID(), workspaceId: workspaceIdFor(user), title: "Faculty invitation queued", body: `An invitation is ready for ${email}. Configure an email provider to deliver it.`, type: "info", unread: true, createdAt: Date.now() });
      await saveData();
      return send(response, 202, { message: "Invitation queued", email });
    }

    if (request.method === "GET" && path === "/settings") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      return send(response, 200, { settings: defaultSettings(user), devices });
    }

    if (request.method === "POST" && path === "/settings") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      if (!requireRole(user, response, ["School Administrator"])) return undefined;
      const body = await readJson(request);
      const previous = defaultSettings(user);
      const settings = { ...previous, schoolName: String(body.schoolName ?? previous.schoolName).trim(), schoolYear: String(body.schoolYear ?? previous.schoolYear).trim(), timezone: String(body.timezone ?? previous.timezone), classStart: String(body.classStart ?? previous.classStart), lateCutoff: String(body.lateCutoff ?? previous.lateCutoff), absentCutoff: String(body.absentCutoff ?? previous.absentCutoff), dismissal: String(body.dismissal ?? previous.dismissal), channels: { ...previous.channels, ...(body.channels && typeof body.channels === "object" ? body.channels : {}) } };
      if (!settings.schoolName) throw new RequestError("School name is required", 400, "SETTINGS_INVALID");
      workspaceSettings.set(workspaceIdFor(user), settings);
      workspaces.get(workspaceIdFor(user)).name = settings.schoolName;
      for (const member of users.values()) if (member.workspaceId === workspaceIdFor(user)) member.schoolName = settings.schoolName;
      await saveData();
      return send(response, 200, { settings });
    }

    if (request.method === "GET" && path === "/notifications") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      const items = notifications.filter((item) => item.workspaceId === workspaceIdFor(user)).sort((a, b) => b.createdAt - a.createdAt);
      return send(response, 200, { notifications: items, unread: items.filter((item) => item.unread).length, settings: defaultSettings(user).channels });
    }

    if (request.method === "POST" && path === "/notifications") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      if (!requireRole(user, response, ["School Administrator", "Registrar"])) return undefined;
      const body = await readJson(request);
      const title = String(body.title ?? "").trim(); const text = String(body.body ?? "").trim();
      if (!title || !text) throw new RequestError("Notification title and body are required", 400, "NOTIFICATION_INVALID");
      const item = { id: randomUUID(), workspaceId: workspaceIdFor(user), title, body: text, type: ["alert", "info", "success"].includes(body.type) ? body.type : "info", unread: true, createdAt: Date.now() };
      notifications.push(item); await saveData();
      return send(response, 201, { notification: item });
    }

    if (request.method === "POST" && path === "/notifications/read-all") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      for (const item of notifications) if (item.workspaceId === workspaceIdFor(user)) item.unread = false;
      await saveData();
      return send(response, 204);
    }

    if (request.method === "GET" && path === "/reports") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      const workspaceScans = scans.filter((scan) => scan.workspaceId === workspaceIdFor(user));
      const learnerList = inWorkspace(learners.values(), user);
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const weekly = Array.from({ length: 5 }, (_, index) => {
        const day = new Date(todayStart); day.setDate(day.getDate() - (4 - index)); const dayEnd = new Date(day); dayEnd.setDate(dayEnd.getDate() + 1);
        const dayScans = workspaceScans.filter((scan) => scan.createdAt >= day.getTime() && scan.createdAt < dayEnd.getTime());
        return { day: day.toLocaleDateString("en-US", { weekday: "short" }), present: dayScans.filter((scan) => scan.status === "present").length, late: dayScans.filter((scan) => scan.status === "late").length, absent: Math.max(0, learnerList.length - new Set(dayScans.map((scan) => scan.identifier)).size) };
      });
      const grades = [...new Set(learnerList.map((learner) => learner.gradeLevel))].map((grade) => { const group = learnerList.filter((learner) => learner.gradeLevel === grade); return { grade, rate: Number((group.reduce((total, learner) => total + learner.rate, 0) / Math.max(1, group.length)).toFixed(1)) }; });
      return send(response, 200, { weekly, gradeBreakdown: grades, reports: reports.filter((report) => report.workspaceId === workspaceIdFor(user)).sort((a, b) => b.createdAt - a.createdAt) });
    }

    if (request.method === "POST" && path === "/reports") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      const body = await readJson(request);
      const type = String(body.type ?? "Daily summary"); const scope = String(body.scope ?? "All grade levels"); const period = String(body.period ?? "Today");
      const report = { id: `R-${randomUUID().slice(0, 8)}`, workspaceId: workspaceIdFor(user), name: `${type} export`, scope, period, format: "CSV", size: "Ready", createdAt: Date.now() };
      reports.push(report);
      await saveData();
      return send(response, 201, { report, csv: "student,grade_section,status,gate,time\n" + scans.filter((scan) => scan.workspaceId === workspaceIdFor(user)).map((scan) => [scan.student, scan.gradeSection, scan.status, scan.gate, scan.timeIn].map((value) => JSON.stringify(value)).join(",")).join("\n") });
    }

    if (request.method === "POST" && path === "/attendance/scanner-sessions") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      const body = await readJson(request);
      const device = devices.find((item) => item.id === body.gateId);
      if (!device) return fail(response, 400, "Unknown scanner device", "INVALID_DEVICE");
      if (!device.online) return fail(response, 409, "Scanner device is offline", "DEVICE_OFFLINE");
      const sessionId = randomUUID();
      if (!["in", "out", "event"].includes(body.sessionType)) return fail(response, 400, "Invalid scanner session type", "SESSION_TYPE_INVALID");
      scannerSessions.set(sessionId, { userId: user.id, workspaceId: workspaceIdFor(user), gateId: device.id, sessionType: body.sessionType, createdAt: Date.now(), expiresAt: Date.now() + scannerSessionLifetime, lastSyncedAt: 0 });
      return send(response, 201, { sessionId });
    }

    if (request.method === "GET" && path === "/attendance/scanner-devices") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      return send(response, 200, { devices: devices.map((device) => ({ ...device, scans: scans.filter((scan) => scan.workspaceId === workspaceIdFor(user) && scan.gate === device.id).length })) });
    }

    if (request.method === "GET" && path === "/attendance/scans/recent") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const recent = scans.filter((scan) => scan.workspaceId === workspaceIdFor(user)).slice(-8).reverse().map((scan) => ({ id: scan.id, name: scan.student, section: scan.gradeSection, time: scan.timeIn, status: scan.status }));
      return send(response, 200, { scans: recent, todayCount: scans.filter((scan) => scan.workspaceId === workspaceIdFor(user) && scan.createdAt >= todayStart.getTime()).length });
    }

    if (request.method === "POST" && path === "/attendance/scanner-sessions/end") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      const body = await readJson(request);
      const session = scannerSessions.get(body.sessionId);
      if (!session || session.userId !== user.id) return fail(response, 400, "Active scanner session required", "SESSION_REQUIRED");
      scannerSessions.delete(body.sessionId);
      return send(response, 204);
    }

    if (request.method === "POST" && path === "/attendance/scanner/sync") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      const body = await readJson(request);
      const session = scannerSessions.get(body.sessionId);
      if (!session || session.userId !== user.id || session.expiresAt <= Date.now()) return fail(response, 400, "Active scanner session required", "SESSION_REQUIRED");
      const pending = scans.filter((scan) => scan.workspaceId === workspaceIdFor(user) && scan.sessionId === body.sessionId && scan.createdAt > session.lastSyncedAt);
      session.lastSyncedAt = Date.now();
      return send(response, 200, { synced: pending.length });
    }

    if (request.method === "POST" && path === "/attendance/scans") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      const body = await readJson(request);
      const session = scannerSessions.get(body.sessionId);
      if (!session || session.userId !== user.id || session.expiresAt <= Date.now()) return fail(response, 400, "Active scanner session required", "SESSION_REQUIRED");
      if (body.sessionType !== session.sessionType) return fail(response, 400, "Scanner session type does not match", "SESSION_TYPE_MISMATCH");
      if (body.gateId !== undefined && body.gateId !== session.gateId) return fail(response, 400, "Scanner gate does not match the active session", "SESSION_GATE_MISMATCH");
      const identifier = String(body.identifier ?? "").trim();
      if (!identifier) return fail(response, 400, "Learner identifier is required", "IDENTIFIER_REQUIRED");
      const learner = findLearner(user, identifier);
      if (!learner) return fail(response, 404, "Learner was not found", "LEARNER_NOT_FOUND");
      const now = Date.now();
      const recentDuplicate = scans.some((scan) => scan.workspaceId === workspaceIdFor(user) && scan.identifier === identifier && scan.gate === session.gateId && scan.createdAt > now - duplicateScanWindow);
      if (recentDuplicate) return fail(response, 409, "Learner was already scanned recently", "DUPLICATE_SCAN");
      const settings = defaultSettings(user);
      const scanTime = new Date(now).toLocaleTimeString("en-CA", { hour12: false, hour: "2-digit", minute: "2-digit" });
      const status = session.sessionType === "out" ? "present" : scanTime > settings.lateCutoff ? "late" : "present";
      const record = { id: `A-${randomUUID().slice(0, 8)}`, student: learner.name, gradeSection: `${learner.gradeLevel} - ${learner.section}`, timeIn: new Date(now).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), status, gate: session.gateId, guardianNotified: body.notifyGuardian === true };
      learner.status = status; learner.lastScan = record.timeIn;
      scans.push({ ...record, workspaceId: workspaceIdFor(user), identifier, sessionId: body.sessionId, createdAt: now });
      if (record.guardianNotified) notifications.push({ id: randomUUID(), workspaceId: workspaceIdFor(user), title: `${status === "late" ? "Late arrival" : "Arrival logged"}: ${learner.name}`, body: `Guardian notification is queued for ${learner.name}.`, type: status === "late" ? "alert" : "success", unread: true, createdAt: now });
      await saveData();
      return send(response, 201, { record, guardianNotified: record.guardianNotified });
    }

    return fail(response, 404, "Route not found", "NOT_FOUND");
  } catch (error) {
    if (error instanceof RequestError) return fail(response, error.status, error.message, error.code);
    console.error(`Unhandled error on ${request.method} ${request.url}:`, error);
    return fail(response, 500, "Something went wrong", "INTERNAL_ERROR");
  }
}

await loadData();
if (!workspaces.has("demo-workspace")) workspaces.set("demo-workspace", { id: "demo-workspace", name: "Northgate Senior High School", createdAt: Date.now() });
if (!workspaceSettings.has("demo-workspace")) workspaceSettings.set("demo-workspace", { workspaceId: "demo-workspace", schoolName: "Northgate Senior High School", schoolYear: "2026–2027", timezone: "Asia/Manila", classStart: "07:00", lateCutoff: "07:15", absentCutoff: "08:00", dismissal: "16:30", channels: { sms: true, push: true, email: true, adviser: false } });
if (seedDemoAccount && !users.has("demo-admin")) {
  const demoPassword = await hashPassword("DemoPassword123!");
  users.set("demo-admin", { id: "demo-admin", workspaceId: "demo-workspace", name: "Marisol Duran", email: "m.duran@northgate.edu.ph", passwordHash: demoPassword, schoolName: "Northgate Senior High School", role: "School Administrator" });
  await saveData();
}

setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessions) if (session.expiresAt <= now) sessions.delete(token);
  for (const [token, session] of scannerSessions) if (session.expiresAt <= now) scannerSessions.delete(token);
  for (const [token, reset] of resetTokens) if (reset.expiresAt <= now) resetTokens.delete(token);
  for (const attempts of [loginAttempts, resetAttempts, registerAttempts]) {
    for (const [key, attempt] of attempts) if (attempt.resetAt <= now) attempts.delete(key);
  }
}, 15 * 60 * 1000).unref();

const server = createServer((request, response) => {
  handle(request, response).catch((error) => {
    console.error("Fatal request failure:", error);
    if (!response.headersSent) fail(response, 500, "Something went wrong", "INTERNAL_ERROR");
    else response.end();
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`AGILA API listening on http://0.0.0.0:${port}`);
  if (seedDemoAccount) console.log("Demo login: m.duran@northgate.edu.ph / DemoPassword123!");
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down AGILA API`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
