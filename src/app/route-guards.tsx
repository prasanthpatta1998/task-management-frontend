import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "./context";

export function AuthRoute() {
  const { user, isAuthLoading } = useAppContext();
  if (isAuthLoading) return <div className="auth-shell"><main className="auth-main"><p>Checking your session…</p></main></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function ProtectedRoute() {
  const { user, isAuthLoading } = useAppContext();
  if (isAuthLoading) return <div className="auth-shell"><main className="auth-main"><p>Checking your session…</p></main></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RootRedirect() {
  const { user } = useAppContext();
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}
