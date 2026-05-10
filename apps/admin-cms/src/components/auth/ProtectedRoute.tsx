import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";

interface ProtectedRouteProps {
  requiredRole?: string;
  allowedRoles?: string[];
  excludedRoles?: string[];
}

export const ProtectedRoute = ({
  requiredRole,
  allowedRoles,
  excludedRoles,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useUserStore();
  const location = useLocation();

  if (isAuthenticated && !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated && !user) {
    // If not authenticated, redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role?.key;

  // Check excluded roles
  if (excludedRoles && userRole && excludedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // Check allowed roles (if provided)
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // Legacy requiredRole check
  if (requiredRole && userRole !== requiredRole) {
    // If authenticated but role doesn't match, redirect to unauthorized page or home
    return <Navigate to="/" replace />;
  }

  // If authenticated and authorized, render the child routes
  return <Outlet />;
};
