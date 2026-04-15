import { Navigate, useLocation } from "react-router";
import { useAuth, Role } from "../contexts/auth-context";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

/**
 * Route guard that redirects unauthenticated users to /login
 * and users with wrong roles to their own dashboard.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { role, loading } = useAuth();
  const location = useLocation();

  // While restoring session from cookie, show a loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Not logged in → send to login, preserving the intended destination
  if (!role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to their own dashboard
  if (!allowedRoles.includes(role)) {
    const dashboardMap: Record<NonNullable<Role>, string> = {
      student: "/student",
      faculty: "/faculty",
      admin: "/admin",
    };
    return <Navigate to={dashboardMap[role as NonNullable<Role>]} replace />;
  }

  return <>{children}</>;
}
