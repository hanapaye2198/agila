import { apiRequest } from "@/lib/api";
import type { AttendanceRecord, AttendanceStatus } from "@/lib/agila-data";

export type DashboardSummary = {
  stats: { enrolled: number; present: number; late: number; guardiansNotified: number; guardianReach: number };
  weekly: { day: string; present: number; late: number; absent: number }[];
  statusSplit: { name: string; key: AttendanceStatus; value: number }[];
  gradeBreakdown: { grade: string; rate: number }[];
  recent: AttendanceRecord[];
};

export const dashboardApi = {
  summary: (signal?: AbortSignal) => apiRequest<DashboardSummary>("/dashboard/summary", { signal }),
};
