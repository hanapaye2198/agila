import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/contexts/auth-context";

export function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Checking session…</div>;
  }

  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
