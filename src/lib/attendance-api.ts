import { apiRequest } from "@/lib/api";
import type { AttendanceRecord, AttendanceStatus } from "@/lib/agila-data";

export type ScanSessionType = "in" | "out" | "event";

export type ScanResult = {
  record: AttendanceRecord;
  guardianNotified: boolean;
};

export type ScannerDevice = { id: string; gate: string; scans: number; online: boolean };
export type RecentScan = { id: string; name: string; section: string; time: string; status: AttendanceStatus };

export const attendanceApi = {
  startScannerSession: (gateId: string, sessionType: ScanSessionType) =>
    apiRequest<{ sessionId: string }>("/attendance/scanner-sessions", {
      method: "POST",
      body: { gateId, sessionType },
    }),
  endScannerSession: (sessionId: string) =>
    apiRequest<void>("/attendance/scanner-sessions/end", {
      method: "POST",
      body: { sessionId },
    }),
  syncScanner: (sessionId: string) =>
    apiRequest<{ synced: number }>("/attendance/scanner/sync", {
      method: "POST",
      body: { sessionId },
    }),
  logManualScan: (payload: { identifier: string; gateId: string; sessionType: ScanSessionType; notifyGuardian: boolean; sessionId: string }) =>
    apiRequest<ScanResult>("/attendance/scans", { method: "POST", body: payload }),
  devices: (signal?: AbortSignal) => apiRequest<{ devices: ScannerDevice[] }>("/attendance/scanner-devices", { signal }),
  recentScans: (signal?: AbortSignal) => apiRequest<{ scans: RecentScan[]; todayCount: number }>("/attendance/scans/recent", { signal }),
};
