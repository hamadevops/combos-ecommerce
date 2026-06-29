import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { auth } from "@/lib/auth";
import { LoginDto, RegisterDto } from "@/types/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setUser, logout: logoutStore } = useUserStore();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginDto) => authApi.login(credentials),
    onSuccess: async (response) => {
      if (response.success && response.data) {
        auth.setToken(response.data.access_token);

        try {
          const profileRes = await authApi.getProfile(response.data.access_token);
          if (profileRes.success && profileRes.data) {
            setUser(profileRes.data);
            queryClient.setQueryData(["profile"], profileRes.data);
          }
        } catch (error) {
          console.error("Failed to fetch profile", error);
        }

        toast.success("Đăng nhập thành công");
        // window.location.href = '/profile'; // use router.push for SPA navigation
        router.push("/profile");
      } else {
        toast.error(response.message || "Đăng nhập thất bại");
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
        router.push("/login");
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
      router.push("/login");
      toast.success("Đã đăng xuất");
    },
  });

  return {
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
};
