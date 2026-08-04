import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";

const root = new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1");

async function startServer() {
  const directory = await mkdtemp(join(tmpdir(), "agila-api-test-"));
  const port = 32000 + Math.floor(Math.random() * 1000);
  const child = spawn(process.execPath, ["server/server.mjs"], {
    cwd: root,
    env: { ...process.env, PORT: String(port), DATA_FILE: join(directory, "data.json"), NODE_ENV: "test" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const output = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Server did not start")), 10_000);
    child.stdout.on("data", (chunk) => { if (String(chunk).includes("AGILA API listening")) { clearTimeout(timer); resolve(); } });
    child.once("error", reject);
  });
  await output;
  return {
    baseUrl: `http://localhost:${port}/api`,
    async stop() { child.kill("SIGTERM"); await once(child, "exit"); await rm(directory, { recursive: true, force: true }); },
  };
}

async function request(baseUrl, path, { method = "GET", body, cookie } = {}) {
  const response = await fetch(`${baseUrl}${path}`, { method, headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const payload = response.status === 204 ? undefined : await response.json();
  return { response, payload, cookie: response.headers.get("set-cookie")?.split(";")[0] };
}

async function register(baseUrl, schoolName) {
  const result = await request(baseUrl, "/auth/register", { method: "POST", body: { name: `${schoolName} Admin`, email: `${schoolName.replace(/\s/g, "").toLowerCase()}-${Date.now()}@example.test`, password: "SecurePassword123!", schoolName } });
  assert.equal(result.response.status, 201);
  assert.ok(result.cookie);
  return result.cookie;
}

test("workspace data is isolated and operational records persist", async () => {
  const server = await startServer();
  try {
    const alpha = await register(server.baseUrl, "Alpha School");
    const beta = await register(server.baseUrl, "Beta School");
    const student = await request(server.baseUrl, "/students", { method: "POST", cookie: alpha, body: { id: "LRN-1", name: "Alpha Learner", gradeLevel: "Grade 10", section: "A", guardian: "Parent", guardianPhone: "123" } });
    assert.equal(student.response.status, 201);

    const alphaStudents = await request(server.baseUrl, "/students", { cookie: alpha });
    const betaStudents = await request(server.baseUrl, "/students", { cookie: beta });
    assert.equal(alphaStudents.payload.total, 1);
    assert.equal(betaStudents.payload.total, 0);

    const savedSettings = await request(server.baseUrl, "/settings", { method: "POST", cookie: alpha, body: { schoolName: "Alpha Updated", lateCutoff: "06:00" } });
    assert.equal(savedSettings.payload.settings.schoolName, "Alpha Updated");
    assert.equal(savedSettings.payload.settings.lateCutoff, "06:00");

    const notification = await request(server.baseUrl, "/notifications", { method: "POST", cookie: alpha, body: { title: "Test notice", body: "Stored only in Alpha", type: "info" } });
    assert.equal(notification.response.status, 201);
    const betaNotifications = await request(server.baseUrl, "/notifications", { cookie: beta });
    assert.equal(betaNotifications.payload.notifications.length, 0);

    const report = await request(server.baseUrl, "/reports", { method: "POST", cookie: alpha, body: { type: "Daily summary", scope: "All grade levels", period: "Today" } });
    assert.equal(report.response.status, 201);
    assert.match(report.payload.csv, /student,grade_section,status/);
  } finally {
    await server.stop();
  }
});
