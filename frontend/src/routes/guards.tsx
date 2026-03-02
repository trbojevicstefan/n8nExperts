import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12 text-center text-[var(--color-text-muted)]">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function RequireRole({ role }: { role: Role }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12 text-center text-[var(--color-text-muted)]">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
