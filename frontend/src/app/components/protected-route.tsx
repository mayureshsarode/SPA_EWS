import { Navigate, useLocation } from "react-router";
import { useAuth, Role } from "../contexts/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

/**
 * Route guard that redirects unauthenticated users to /login
 * and users with wrong roles to their own dashboard.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { role } = useAuth();
  const location = useLocation();

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
