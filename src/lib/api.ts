export type ApiError = Error & { status?: number; code?: string; details?: unknown };
import { offlineRequest } from "@/lib/offline-api";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");
// Render free instances can take roughly a minute to wake after inactivity.
// Deployments can override this without changing application code.
const configuredTimeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 70_000);
const DEFAULT_REQUEST_TIMEOUT_MS = Number.isFinite(configuredTimeoutMs) && configuredTimeoutMs > 0
  ? configuredTimeoutMs
  : 70_000;

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  timeoutMs?: number;
};

export function clearStoredToken() {
  if (typeof sessionStorage !== "undefined") sessionStorage.removeItem("agila_access_token");
  if (typeof localStorage !== "undefined") localStorage.removeItem("agila_access_token");
}

function getStoredToken() {
  return (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("agila_access_token") : null)
    ?? (typeof localStorage !== "undefined" ? localStorage.getItem("agila_access_token") : null);
}

function abortError() {
  const error = new Error("The request timed out or was cancelled.") as ApiError;
  error.code = "REQUEST_ABORTED";
  return error;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  // The mobile build is deliberately local-first while the hosted API is paused.
  return offlineRequest<T>(path, options);
  /*
  const { timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS, signal, ...requestOptions } = options;
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  if (signal?.aborted) throw abortError();

  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  const abortHandler = () => controller.abort();
  signal?.addEventListener("abort", abortHandler, { once: true });

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: "include",
      headers,
      signal: controller.signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw abortError();
    const error = new Error("Unable to reach the server. Check your connection and try again.") as ApiError;
    error.code = "NETWORK_ERROR";
    error.details = cause;
    throw error;
  } finally {
    globalThis.clearTimeout(timer);
    signal?.removeEventListener("abort", abortHandler);
  }

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type") ?? "";
  let payload: unknown;
  try {
    payload = contentType.includes("application/json") ? await response.json() : await response.text();
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredToken();
      if (typeof window !== "undefined") window.dispatchEvent(new Event("agila:auth-expired"));
    }
    const message = typeof payload === "object" && payload && "message" in payload
      ? String(payload.message)
      : `Request failed with status ${response.status}`;
    const error = new Error(message) as ApiError;
    error.status = response.status;
    if (typeof payload === "object" && payload) {
      if ("code" in payload) error.code = String(payload.code);
      if ("details" in payload) error.details = payload.details;
    }
    throw error;
  }

  return payload as T; */
}

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolName?: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken?: string;
};

export const authApi = {
  login: (email: string, password: string, remember: boolean) =>
    apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password, remember },
    }),
  register: (payload: Record<string, string>) =>
    apiRequest<AuthResponse>("/auth/register", { method: "POST", body: payload }),
  requestPasswordReset: (email: string) =>
    apiRequest<{ message?: string; resetToken?: string }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
    }),
  resetPassword: (token: string, password: string) =>
    apiRequest<void>("/auth/reset-password", {
      method: "POST",
      body: { token, password },
    }),
  session: (signal?: AbortSignal) => apiRequest<{ user: AuthUser }>("/auth/me", { signal }),
  logout: () => apiRequest<void>("/auth/logout", { method: "POST" }),
};
