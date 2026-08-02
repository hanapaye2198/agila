export type ApiError = Error & { status?: number; code?: string; details?: unknown };

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  timeoutMs?: number;
};

export function clearStoredToken() {
  sessionStorage.removeItem("agila_access_token");
  localStorage.removeItem("agila_access_token");
}

function getStoredToken() {
  return sessionStorage.getItem("agila_access_token") ?? localStorage.getItem("agila_access_token");
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 15_000, signal, ...requestOptions } = options;
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });

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
    if (cause instanceof DOMException && cause.name === "AbortError") {
      const error = new Error("The request timed out or was cancelled.") as ApiError;
      error.code = "REQUEST_ABORTED";
      throw error;
    }
    throw cause;
  } finally {
    window.clearTimeout(timer);
  }

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
      window.dispatchEvent(new Event("agila:auth-expired"));
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

  return payload as T;
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
    apiRequest<{ message?: string }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
    }),
  session: () => apiRequest<{ user: AuthUser }>("/auth/me"),
  logout: () => apiRequest<void>("/auth/logout", { method: "POST" }),
};
