import { apiRequest } from "@/lib/api";
import type { AttendanceRecord } from "@/lib/agila-data";

export type ScanSessionType = "in" | "out" | "event";

export type ScanResult = {
  record: AttendanceRecord;
  guardianNotified: boolean;
};

export const attendanceApi = {
  startScannerSession: (gateId: string, sessionType: ScanSessionType) =>
    apiRequest<{ sessionId: string }>("/attendance/scanner-sessions", {
      method: "POST",
      body: { gateId, sessionType },
    }),
  syncScanner: (sessionId?: string) =>
    apiRequest<{ synced: number }>("/attendance/scanner/sync", {
      method: "POST",
      body: sessionId ? { sessionId } : undefined,
    }),
  logManualScan: (payload: { identifier: string; gateId: string; sessionType: ScanSessionType; notifyGuardian: boolean; sessionId: string }) =>
    apiRequest<ScanResult>("/attendance/scans", { method: "POST", body: payload }),
};
