import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { authApi, clearStoredToken, type AuthUser } from "@/lib/api";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  register: (payload: Record<string, string>) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ resetToken?: string }>;
  resetPassword: (token: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const handleAuthExpired = () => setUser(null);
    window.addEventListener("agila:auth-expired", handleAuthExpired);

    authApi
      .session(controller.signal)
      .then(({ user: currentUser }) => { if (!controller.signal.aborted) setUser(currentUser); })
      .catch(() => { if (!controller.signal.aborted) setUser(null); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => {
      controller.abort();
      window.removeEventListener("agila:auth-expired", handleAuthExpired);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async (email, password, remember) => {
        const response = await authApi.login(email, password, remember);
        clearStoredToken();
        if (response.accessToken) {
          const storage = remember ? localStorage : sessionStorage;
          storage.setItem("agila_access_token", response.accessToken);
        }
        setUser(response.user);
      },
      register: async (payload) => {
        const response = await authApi.register(payload);
        clearStoredToken();
        if (response.accessToken) sessionStorage.setItem("agila_access_token", response.accessToken);
        setUser(response.user);
      },
      requestPasswordReset: async (email) => {
        return authApi.requestPasswordReset(email);
      },
      resetPassword: async (token, password) => {
        await authApi.resetPassword(token, password);
      },
      signOut: async () => {
        try {
          await authApi.logout();
        } finally {
          clearStoredToken();
          setUser(null);
        }
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
