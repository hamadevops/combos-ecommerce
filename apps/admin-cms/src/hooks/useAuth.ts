import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { auth } from "@/lib/auth";
import { LoginDto, RegisterDto } from "@/types/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setUser, logout: logoutStore } = useUserStore();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginDto) => authApi.login(credentials),
    onSuccess: async (response) => {
      if (response.success && response.data) {
        auth.setToken(response.data.access_token);

        try {
          const profileRes = await authApi.getProfile(response.data.access_token);
          if (profileRes.success && profileRes.data) {
            // auth.setUser(profileRes.data); // Removed as per request
            setUser(profileRes.data);
            queryClient.setQueryData(["profile"], profileRes.data);
          }
        } catch (error) {
          console.error("Failed to fetch profile", error);
        }

        toast.success("Đăng nhập thành công");
        window.location.href = "/";
      } else {
        toast.error(response.message || "Login failed");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Đăng nhập thất bại");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterDto) => authApi.register(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Đăng ký thành công");
        navigate("/login");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Đăng ký thất bại");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      auth.clear();
      logoutStore();
      queryClient.clear();
      navigate("/login");
      toast.success("Đã đăng xuất");
    },
  });

  return {
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
};
