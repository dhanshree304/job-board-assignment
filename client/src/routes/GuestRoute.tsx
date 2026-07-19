import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export function GuestRoute() {
  const { token, user } = useAuthStore();
  if (token && user) {
    return <Navigate to={user.role === "employer" ? "/employer" : "/dashboard"} replace />;
  }
  return <Outlet />;
}
