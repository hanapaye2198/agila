import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/contexts/auth-context";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Checking session…</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
