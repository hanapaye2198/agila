import { apiRequest } from "@/lib/api";

export type WorkspaceSettings = {
  schoolName: string; schoolYear: string; timezone: string; classStart: string; lateCutoff: string; absentCutoff: string; dismissal: string;
  channels: { sms: boolean; push: boolean; email: boolean; adviser: boolean };
};
export type NotificationItem = { id: string; title: string; body: string; type: "alert" | "info" | "success"; unread: boolean; createdAt: number };
export type Report = { id: string; name: string; scope: string; period: string; format: string; size: string; createdAt: number };

export const workspaceApi = {
  settings: () => apiRequest<{ settings: WorkspaceSettings; devices: { id: string; gate: string; online: boolean }[] }>("/settings"),
  saveSettings: (settings: Partial<WorkspaceSettings>) => apiRequest<{ settings: WorkspaceSettings }>("/settings", { method: "POST", body: settings }),
  notifications: () => apiRequest<{ notifications: NotificationItem[]; unread: number; settings: WorkspaceSettings["channels"] }>("/notifications"),
  createNotification: (payload: { title: string; body: string; type?: NotificationItem["type"] }) => apiRequest<{ notification: NotificationItem }>("/notifications", { method: "POST", body: payload }),
  markNotificationsRead: () => apiRequest<void>("/notifications/read-all", { method: "POST" }),
  reports: () => apiRequest<{ weekly: { day: string; present: number; late: number; absent: number }[]; gradeBreakdown: { grade: string; rate: number }[]; reports: Report[] }>("/reports"),
  createReport: (payload: { type: string; scope: string; period: string }) => apiRequest<{ report: Report; csv: string }>("/reports", { method: "POST", body: payload }),
};
