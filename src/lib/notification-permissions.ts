import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export type NotificationPermission = "granted" | "denied" | "prompt" | "unsupported";

function toPermission(value: string): NotificationPermission {
  if (value === "granted" || value === "denied" || value === "prompt") return value;
  return "prompt";
}

export async function notificationPermission(): Promise<NotificationPermission> {
  if (!Capacitor.isNativePlatform()) return "unsupported";
  const status = await LocalNotifications.checkPermissions();
  return toPermission(status.display);
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!Capacitor.isNativePlatform()) return "unsupported";
  const status = await LocalNotifications.requestPermissions();
  return toPermission(status.display);
}
