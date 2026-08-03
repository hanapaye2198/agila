import { createServer } from "node:http";
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const dataFile = fileURLToPath(new URL("./data.json", import.meta.url));
const port = Number(process.env.PORT ?? 3000);
const allowedOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";
const isProduction = process.env.NODE_ENV === "production";
const exposeResetToken = !isProduction && process.env.EXPOSE_RESET_TOKEN === "true";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
const scannerSessions = new Map();
const scans = [];
const learners = new Map([
  ["NG-24-0117", { name: "Althea Marquez", section: "Grade 11 - Sampaguita" }],
  ["NG-24-0132", { name: "Jomar Villanueva", section: "Grade 12 - Narra" }],
  ["NG-24-0145", { name: "Bianca Solano", section: "Grade 9 - Molave" }],
]);

const devices = [
  { id: "NG-SCN-01", gate: "Main Gate", online: true },
  { id: "NG-SCN-02", gate: "East Gate", online: true },
  { id: "NG-SCN-03", gate: "Annex Gate", online: true },
  { id: "NG-SCN-04", gate: "Gym Entrance", online: false },
];

async function loadData() {
  try {
    const saved = JSON.parse(await readFile(dataFile, "utf8"));
    for (const user of saved.users ?? []) users.set(user.id, user);
    for (const scan of saved.scans ?? []) scans.push(scan);
  } catch (error) {
    if (error.code !== "ENOENT") console.warn(`Unable to load ${dataFile}: ${error.message}`);
  }
}

let savePending = Promise.resolve();

function saveData() {
  savePending = savePending.then(async () => {
    const temporaryFile = `${dataFile}.${randomBytes(6).toString("hex")}.tmp`;
    await writeFile(temporaryFile, JSON.stringify({ users: [...users.values()], scans }, null, 2), "utf8");
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
    "Access-Control-Allow-Origin": allowedOrigin,
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  response.end(payload);
}

function fail(response, status, message, code = "REQUEST_FAILED", details, headers) {
  send(response, status, { message, code, ...(details === undefined ? {} : { details }) }, headers);
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
  };
  users.set(user.id, user);
  await saveData();
  return user;
}

function usersByEmail(email) {
  return [...users.values()].find((user) => user.email === email);
}

async function handle(request, response) {
  if (request.method === "OPTIONS") return send(response, 204);
  if (request.headers.origin && request.headers.origin !== allowedOrigin) return fail(response, 403, "Origin is not allowed", "ORIGIN_FORBIDDEN");
  const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);
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

    if (request.method === "POST" && path === "/attendance/scanner-sessions") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      const body = await readJson(request);
      const device = devices.find((item) => item.id === body.gateId);
      if (!device) return fail(response, 400, "Unknown scanner device", "INVALID_DEVICE");
      if (!device.online) return fail(response, 409, "Scanner device is offline", "DEVICE_OFFLINE");
      const sessionId = randomUUID();
      if (!["in", "out", "event"].includes(body.sessionType)) return fail(response, 400, "Invalid scanner session type", "SESSION_TYPE_INVALID");
      scannerSessions.set(sessionId, { userId: user.id, gateId: device.id, sessionType: body.sessionType, createdAt: Date.now(), expiresAt: Date.now() + scannerSessionLifetime, lastSyncedAt: 0 });
      return send(response, 201, { sessionId });
    }

    if (request.method === "GET" && path === "/attendance/scanner-devices") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      return send(response, 200, { devices: devices.map((device) => ({ ...device, scans: scans.filter((scan) => scan.gate === device.id).length })) });
    }

    if (request.method === "GET" && path === "/attendance/scans/recent") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const recent = scans.slice(-8).reverse().map((scan) => ({ id: scan.id, name: scan.student, section: scan.gradeSection, time: scan.timeIn, status: scan.status }));
      return send(response, 200, { scans: recent, todayCount: scans.filter((scan) => scan.createdAt >= todayStart.getTime()).length });
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
      const pending = scans.filter((scan) => scan.sessionId === body.sessionId && scan.createdAt > session.lastSyncedAt);
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
      const learner = learners.get(identifier);
      if (!learner) return fail(response, 404, "Learner was not found", "LEARNER_NOT_FOUND");
      const now = Date.now();
      const recentDuplicate = scans.some((scan) => scan.identifier === identifier && scan.gate === session.gateId && scan.createdAt > now - duplicateScanWindow);
      if (recentDuplicate) return fail(response, 409, "Learner was already scanned recently", "DUPLICATE_SCAN");
      const record = { id: `A-${randomUUID().slice(0, 8)}`, student: learner.name, gradeSection: learner.section, timeIn: new Date(now).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), status: "present", gate: session.gateId, guardianNotified: body.notifyGuardian === true };
      scans.push({ ...record, identifier, sessionId: body.sessionId, createdAt: now });
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
if (!isProduction && !users.has("demo-admin")) {
  const demoPassword = await hashPassword("DemoPassword123!");
  users.set("demo-admin", { id: "demo-admin", name: "Marisol Duran", email: "m.duran@northgate.edu.ph", passwordHash: demoPassword, schoolName: "Northgate Senior High School", role: "School Administrator" });
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

server.listen(port, () => {
  console.log(`AGILA API listening on http://localhost:${port}`);
  if (!isProduction) console.log("Demo login: m.duran@northgate.edu.ph / DemoPassword123!");
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down AGILA API`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
