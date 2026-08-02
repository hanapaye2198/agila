import { createServer } from "node:http";
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const port = Number(process.env.PORT ?? 3000);
const allowedOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";
const sessions = new Map();
const users = new Map();
const scannerSessions = new Map();
const scans = [];

const devices = [
  { id: "NG-SCN-01", gate: "Main Gate", online: true },
  { id: "NG-SCN-02", gate: "East Gate", online: true },
  { id: "NG-SCN-03", gate: "Annex Gate", online: true },
  { id: "NG-SCN-04", gate: "Gym Entrance", online: false },
];

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

function fail(response, status, message, code = "REQUEST_FAILED", details) {
  send(response, status, { message, code, ...(details === undefined ? {} : { details }) });
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie ?? "").split(";").filter(Boolean).map((part) => {
    const index = part.indexOf("=");
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }));
}

function getSession(request) {
  const cookies = parseCookies(request);
  const bearer = request.headers.authorization?.startsWith("Bearer ")
    ? request.headers.authorization.slice(7)
    : undefined;
  const token = bearer ?? cookies.agila_session;
  return token ? sessions.get(token) : undefined;
}

function requireSession(request, response) {
  const session = getSession(request);
  if (!session) {
    fail(response, 401, "Authentication required", "AUTH_REQUIRED");
    return undefined;
  }
  const user = users.get(session.userId);
  if (!user) {
    fail(response, 401, "Session is no longer valid", "SESSION_INVALID");
    return undefined;
  }
  return user;
}

async function readJson(request) {
  let raw = "";
  for await (const chunk of request) raw += chunk;
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { throw new Error("Invalid JSON body"); }
}

async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${Buffer.from(derived).toString("hex")}`;
}

async function verifyPassword(password, stored) {
  const [salt, expectedHex] = stored.split(":");
  const actual = Buffer.from(await hashPassword(password, salt).then((value) => value.split(":")[1]), "hex");
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, schoolName: user.schoolName };
}

function sessionCookie(token, remember) {
  return `agila_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${remember ? "; Max-Age=2592000" : ""}`;
}

async function createUser({ name, email, password, phone, schoolName, schoolType, enrollmentSize }) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  if (!name || !normalizedEmail || !password || !schoolName) throw new Error("Name, email, password, and school are required");
  if (password.length < 10) throw new Error("Password must be at least 10 characters");
  if (usersByEmail(normalizedEmail)) throw new Error("An account with this email already exists");
  const user = { id: randomUUID(), name, email: normalizedEmail, passwordHash: await hashPassword(password), phone, schoolName, schoolType, enrollmentSize, role: "School Administrator" };
  users.set(user.id, user);
  return user;
}

function usersByEmail(email) {
  return [...users.values()].find((user) => user.email === email);
}

async function handle(request, response) {
  if (request.method === "OPTIONS") return send(response, 204);
  const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);
  const path = url.pathname.replace(/^\/api(?=\/|$)/, "") || "/";

  try {
    if (request.method === "POST" && path === "/auth/login") {
      const body = await readJson(request);
      const user = usersByEmail(String(body.email ?? "").trim().toLowerCase());
      if (!user || !(await verifyPassword(String(body.password ?? ""), user.passwordHash))) return fail(response, 401, "Invalid email or password", "INVALID_CREDENTIALS");
      const token = randomBytes(32).toString("hex");
      sessions.set(token, { userId: user.id, createdAt: Date.now() });
      return send(response, 200, { user: publicUser(user) }, { "Set-Cookie": sessionCookie(token, body.remember === true) });
    }

    if (request.method === "POST" && path === "/auth/register") {
      const body = await readJson(request);
      let user;
      try { user = await createUser(body); } catch (error) { return fail(response, 400, error.message, "REGISTRATION_INVALID"); }
      const token = randomBytes(32).toString("hex");
      sessions.set(token, { userId: user.id, createdAt: Date.now() });
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
      return send(response, 204, undefined, { "Set-Cookie": "agila_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax" });
    }

    if (request.method === "POST" && path === "/auth/forgot-password") {
      await readJson(request);
      return send(response, 202, { message: "If the email is registered, a reset link has been sent." });
    }

    if (request.method === "POST" && path === "/attendance/scanner-sessions") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      const body = await readJson(request);
      const device = devices.find((item) => item.id === body.gateId);
      if (!device) return fail(response, 400, "Unknown scanner device", "INVALID_DEVICE");
      if (!device.online) return fail(response, 409, "Scanner device is offline", "DEVICE_OFFLINE");
      const sessionId = randomUUID();
      scannerSessions.set(sessionId, { userId: user.id, gateId: device.id, sessionType: body.sessionType, createdAt: Date.now() });
      return send(response, 201, { sessionId });
    }

    if (request.method === "POST" && path === "/attendance/scanner/sync") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      const body = await readJson(request);
      const session = scannerSessions.get(body.sessionId);
      if (!session || session.userId !== user.id) return fail(response, 400, "Active scanner session required", "SESSION_REQUIRED");
      return send(response, 200, { synced: scans.filter((scan) => scan.sessionId === body.sessionId).length });
    }

    if (request.method === "POST" && path === "/attendance/scans") {
      const user = requireSession(request, response);
      if (!user) return undefined;
      const body = await readJson(request);
      const session = scannerSessions.get(body.sessionId);
      if (!session || session.userId !== user.id) return fail(response, 400, "Active scanner session required", "SESSION_REQUIRED");
      if (!body.identifier) return fail(response, 400, "Learner identifier is required", "IDENTIFIER_REQUIRED");
      const record = { id: `A-${String(scans.length + 1).padStart(4, "0")}`, student: body.identifier, gradeSection: "Unassigned", timeIn: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), status: "present", gate: session.gateId, guardianNotified: body.notifyGuardian === true };
      scans.push({ ...record, sessionId: body.sessionId });
      return send(response, 201, { record, guardianNotified: record.guardianNotified });
    }

    return fail(response, 404, "Route not found", "NOT_FOUND");
  } catch (error) {
    return fail(response, 400, error instanceof Error ? error.message : "Bad request", "BAD_REQUEST");
  }
}

const demoPassword = await hashPassword("DemoPassword123!");
users.set("demo-admin", { id: "demo-admin", name: "Marisol Duran", email: "m.duran@northgate.edu.ph", passwordHash: demoPassword, schoolName: "Northgate Senior High School", role: "School Administrator" });

createServer((request, response) => handle(request, response)).listen(port, () => {
  console.log(`AGILA API listening on http://localhost:${port}`);
  console.log("Demo login: m.duran@northgate.edu.ph / DemoPassword123!");
});
