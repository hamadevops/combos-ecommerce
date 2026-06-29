import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";

export const GuestRoute = () => {
  const { isAuthenticated, user } = useUserStore();

  if (isAuthenticated && !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role?.key === "admin" || user?.role?.name === "Administrator") {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
