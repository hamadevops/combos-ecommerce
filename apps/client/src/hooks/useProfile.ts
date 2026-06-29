import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { authApi } from "@/api/auth";
import { auth } from "@/lib/auth";
import { useUserStore } from "@/store/useUserStore";
import { useAuth } from "./useAuth";

export const useProfile = () => {
  const { setUser } = useUserStore();
  const { logout } = useAuth();

  const query = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await authApi.getProfile();
      if (res.success && res.data) {
        setUser(res.data);
      }
      return res.data;
    },
    enabled: auth.isAuthenticated(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (query.isError && auth.isAuthenticated() && !logout.isPending) {
      auth.clear(); // Clear token synchronously to make auth.isAuthenticated() false immediately
      logout.mutate();
    }
  }, [query.isError, logout]);

  return query;
};
