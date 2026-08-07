import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from "@capacitor-community/sqlite";
import { gradeBreakdown, notifications, recentAttendance, reports, students, teachers, weeklyAttendance } from "@/lib/agila-data";

type State = {
  students: typeof students; teachers: typeof teachers; attendance: typeof recentAttendance;
  notifications: Array<(typeof notifications)[number] & { createdAt: number }>;
  reports: Array<(typeof reports)[number] & { createdAt: number }>;
  settings: { schoolName: string; schoolYear: string; timezone: string; classStart: string; lateCutoff: string; absentCutoff: string; dismissal: string; channels: { sms: boolean; push: boolean; email: boolean; adviser: boolean } };
  sessions: Record<string, { gateId: string; sessionType: "in" | "out" | "event" }>;
  authenticated: boolean;
  recentCodes: Record<string, number>;
};

const DB_NAME = "agila_offline";
const STORAGE_KEY = "agila_offline_state_v1";
let database: SQLiteDBConnection | undefined;
let statePromise: Promise<State> | undefined;
const sqlite = new SQLiteConnection(CapacitorSQLite);

function seed(): State {
  return {
    students: structuredClone(students), teachers: structuredClone(teachers), attendance: structuredClone(recentAttendance),
    notifications: notifications.map((item, index) => ({ ...item, createdAt: Date.now() - index * 3_600_000 })),
    reports: reports.map((item, index) => ({ ...item, createdAt: Date.now() - index * 86_400_000 })),
    settings: { schoolName: "Northgate Senior High School", schoolYear: "2026–2027", timezone: "Asia/Manila", classStart: "07:00", lateCutoff: "07:15", absentCutoff: "08:00", dismissal: "16:30", channels: { sms: true, push: true, email: true, adviser: false } },
    sessions: {},
    authenticated: false,
    recentCodes: {},
  };
}

function hydrate(value: Partial<State>): State {
  const initial = seed();
  return { ...initial, ...value, settings: { ...initial.settings, ...value.settings, channels: { ...initial.settings.channels, ...value.settings?.channels } }, sessions: value.sessions ?? {}, recentCodes: value.recentCodes ?? {} };
}

async function getDatabase() {
  if (!Capacitor.isNativePlatform()) return undefined;
  if (database) return database;
  const existing = await sqlite.isConnection(DB_NAME, false);
  database = existing.result
    ? await sqlite.retrieveConnection(DB_NAME, false)
    : await sqlite.createConnection(DB_NAME, false, "no-encryption", 1, false);
  const connection = database;
  await connection.open();
  await connection.execute("CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id = 1), payload TEXT NOT NULL)");
  return database;
}

async function load(): Promise<State> {
  if (!statePromise) statePromise = (async () => {
    const db = await getDatabase();
    if (db) {
      const result = await db.query("SELECT payload FROM app_state WHERE id = 1");
      if (result.values?.[0]?.payload) {
        try { return hydrate(JSON.parse(result.values[0].payload) as Partial<State>); }
        catch { await db.run("UPDATE app_state SET payload = ? WHERE id = 1", [JSON.stringify(seed())]); return seed(); }
      }
      const initial = seed();
      await db.run("INSERT INTO app_state (id, payload) VALUES (1, ?)", [JSON.stringify(initial)]);
      return initial;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    try { return saved ? hydrate(JSON.parse(saved) as Partial<State>) : seed(); }
    catch { localStorage.removeItem(STORAGE_KEY); return seed(); }
  })();
  return statePromise;
}

async function save(state: State) {
  const db = await getDatabase();
  if (db) await db.run("UPDATE app_state SET payload = ? WHERE id = 1", [JSON.stringify(state)]);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function id(prefix: string) { return `${prefix}-${crypto.randomUUID().slice(0, 8)}`; }
function time() { return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }).format(new Date()); }
function statusForScan(sessionType: string): "present" | "late" { return sessionType === "in" && new Date().getHours() >= 7 ? "late" : "present"; }
function csv(state: State) { return ["Student,Grade/Section,Time,Status,Gate", ...state.attendance.map((row) => [row.student, row.gradeSection, row.timeIn, row.status, row.gate].map((value) => `\"${String(value).replaceAll("\"", "\"\"")}\"`).join(","))].join("\n"); }
function offlineError(message: string, code: string) { return Object.assign(new Error(message), { code }); }

export async function offlineRequest<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const method = options.method ?? "GET";
  const body = (options.body ?? {}) as Record<string, any>;
  const [route, queryString = ""] = path.split("?");
  const query = new URLSearchParams(queryString);
  const state = await load();
  const devices = [
    { id: "NG-SCN-01", gate: "Main Gate", online: true }, { id: "NG-SCN-02", gate: "East Gate", online: true },
    { id: "NG-SCN-03", gate: "Annex Gate", online: true }, { id: "NG-SCN-04", gate: "Gym Entrance", online: false },
  ];
  const user = { id: "offline-admin", name: "Marisol Duran", email: "m.duran@northgate.edu.ph", role: "School Administrator", schoolName: state.settings.schoolName };
  const result = async (value: unknown, changed = false) => { if (changed) await save(state); return value as T; };

  if (route === "/auth/login" && method === "POST") {
    if (String(body.email).trim().toLowerCase() !== user.email || body.password !== "DemoPassword123!") throw offlineError("Use the demo account credentials shown on the sign-in screen.", "INVALID_CREDENTIALS");
    state.authenticated = true; return result({ user, accessToken: "offline-session" }, true);
  }
  if (route === "/auth/register" && method === "POST") { state.authenticated = true; return result({ user: { ...user, name: body.name || user.name, email: body.email || user.email, schoolName: body.schoolName || user.schoolName }, accessToken: "offline-session" }, true); }
  if (route === "/auth/me") { if (!state.authenticated) throw offlineError("Sign in to access the offline demo.", "AUTH_REQUIRED"); return result({ user }); }
  if (route === "/auth/logout") { state.authenticated = false; return result(undefined, true); }
  if (route === "/auth/reset-password") return result(undefined);
  if (route === "/auth/forgot-password") return result({ message: "Offline mode: password reset is unavailable." });

  if (route === "/dashboard/summary") {
    const counts = Object.fromEntries(["present", "late", "absent", "excused"].map((key) => [key, state.attendance.filter((record) => record.status === key).length]));
    return result({ stats: { enrolled: state.students.length, present: counts.present, late: counts.late, guardiansNotified: state.attendance.filter((r) => r.guardianNotified).length, guardianReach: 100 }, weekly: weeklyAttendance, statusSplit: ["present", "late", "absent", "excused"].map((key) => ({ name: key[0].toUpperCase() + key.slice(1), key, value: counts[key] })), gradeBreakdown, recent: state.attendance });
  }
  if (route === "/students" && method === "GET") {
    const text = (query.get("query") || "").toLowerCase(); const grade = query.get("grade"); const status = query.get("status");
    const filtered = state.students.filter((student) => (!text || `${student.id} ${student.name}`.toLowerCase().includes(text)) && (!grade || student.gradeLevel === grade) && (!status || student.status === status));
    return result({ students: filtered, total: filtered.length, hasMore: false, stats: { enrolled: state.students.length, guardiansLinked: state.students.filter((s) => s.guardian).length } });
  }
  if (route === "/students" && method === "POST") { const student = { ...body, status: "absent", rate: 0, lastScan: "—" } as typeof students[number]; state.students.unshift(student); return result({ student }, true); }
  if (route === "/students/import" && method === "POST") { const incoming = body.students as State["students"]; state.students.push(...incoming.map((student) => ({ ...student, status: "absent" as const, rate: 0, lastScan: "—" }))); return result({ imported: incoming.length, total: state.students.length }, true); }
  if (route === "/teachers" && method === "GET") { const text = (query.get("query") || "").toLowerCase(); const rows = state.teachers.filter((teacher) => `${teacher.name} ${teacher.email}`.toLowerCase().includes(text)); return result({ teachers: rows, total: rows.length, stats: { faculty: state.teachers.length, advisers: state.teachers.filter((t) => t.advisory).length } }); }
  if (route === "/teachers" && method === "POST") { const teacher = { ...body, id: id("T"), classes: 0, status: "active" } as typeof teachers[number]; state.teachers.unshift(teacher); return result({ teacher }, true); }
  if (route === "/teachers/invite") return result({ message: "Invitation saved locally.", email: body.email });
  if (route === "/settings" && method === "GET") return result({ settings: state.settings, devices });
  if (route === "/settings" && method === "POST") { state.settings = { ...state.settings, ...body, channels: { ...state.settings.channels, ...body.channels } }; return result({ settings: state.settings }, true); }
  if (route === "/notifications" && method === "GET") return result({ notifications: state.notifications, unread: state.notifications.filter((n) => n.unread).length, settings: state.settings.channels });
  if (route === "/notifications" && method === "POST") { const notification = { id: id("N"), title: body.title, body: body.body, type: body.type || "info", unread: true, time: "Now", createdAt: Date.now() }; state.notifications.unshift(notification); return result({ notification }, true); }
  if (route === "/notifications/read-all") { state.notifications.forEach((n) => { n.unread = false; }); return result(undefined, true); }
  if (route === "/reports" && method === "GET") return result({ weekly: weeklyAttendance, gradeBreakdown, reports: state.reports });
  if (route === "/reports" && method === "POST") { const report = { id: id("R"), name: `${body.type} report`, scope: body.scope, period: body.period, format: "CSV", size: "Local", createdAt: Date.now() }; state.reports.unshift(report); return result({ report, csv: csv(state) }, true); }

  if (route === "/attendance/scanner-devices") return result({ devices: devices.map((device) => ({ ...device, scans: state.attendance.filter((record) => record.gate === device.gate).length })) });
  if (route === "/attendance/scans/recent") return result({ scans: state.attendance.slice(0, 8).map((record) => ({ id: record.id, name: record.student, section: record.gradeSection, time: record.timeIn, status: record.status })), todayCount: state.attendance.length });
  if (route === "/attendance/scanner-sessions" && method === "POST") { const sessionId = id("SESSION"); state.sessions[sessionId] = { gateId: body.gateId, sessionType: body.sessionType }; return result({ sessionId }, true); }
  if (route === "/attendance/scanner-sessions/end" && method === "POST") { delete state.sessions[body.sessionId]; return result(undefined, true); }
  if (route === "/attendance/scanner/sync") return result({ synced: 0 });
  if (route === "/attendance/scans" && method === "POST") {
    const session = state.sessions[body.sessionId]; if (!session) throw new Error("Scanner session is no longer active.");
    const identifier = String(body.identifier).trim().toLowerCase();
    const lastScan = state.recentCodes[identifier] ?? 0;
    if (Date.now() - lastScan < 30_000) throw offlineError("This QR code was already logged in the last 30 seconds.", "DUPLICATE_SCAN");
    const student = state.students.find((item) => item.id.toLowerCase() === identifier);
    if (!student) throw new Error("No learner matches this QR code or identifier.");
    const record = { id: id("A"), student: student.name, gradeSection: `${student.gradeLevel} – ${student.section}`, timeIn: time(), status: statusForScan(session.sessionType), gate: devices.find((d) => d.id === session.gateId)?.gate || session.gateId, guardianNotified: Boolean(body.notifyGuardian) };
    state.attendance.unshift(record); state.recentCodes[identifier] = Date.now(); student.status = record.status; student.lastScan = record.timeIn; return result({ record, guardianNotified: record.guardianNotified }, true);
  }
  throw new Error(`Offline route not implemented: ${method} ${route}`);
}
