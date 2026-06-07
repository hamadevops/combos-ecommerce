import {
  authLogin,
  userRegister,
  authGetProfile,
  userUpdateProfile,
  userChangePassword,
} from "@/generated/api";
import "@/lib/openapi-config";
import { request } from "@/lib/api-helper";
import {
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
  ChangePasswordDto,
  LoginResponse,
  UserProfile,
} from "@/types/auth";
import { BaseResponse } from "@/types/common";
import { apiClient } from "@/lib/api-client"; // Fallback

export const authApi = {
  // Login
  login: (credentials: LoginDto) => {
    return request<BaseResponse<LoginResponse>>(
      authLogin({
        body: credentials,
      }) as any,
    );
  },

  // Register
  register: (data: RegisterDto) => {
    return request<BaseResponse<UserProfile>>(
      userRegister({
        body: data,
      }) as any,
    );
  },

  // Get Profile
  getProfile: (token?: string) => {
    // Generated client uses singleton 'client' which has interceptor for token.
    // If we pass explicit token, generated client might not support overriding header easily per request
    // UNLESS we use 'options.headers'.
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    return request<BaseResponse<UserProfile>>(
      authGetProfile({
        headers: headers,
      }) as any,
    );
  },

  // Update Profile
  updateProfile: (data: UpdateProfileDto) => {
    return request<BaseResponse<UserProfile>>(
      userUpdateProfile({
        body: data as any,
      }) as any,
    );
  },

  // Change Password
  changePassword: (data: ChangePasswordDto) => {
    return request<void>(
      userChangePassword({
        body: data,
      }) as any,
    );
  },

  // Logout
  logout: () => {
    // authLogout might not exist generated if it's just 201 void.
    // We can try calling it.
    // If not, fallback to apiClient or client.post
    // I'll assume apiClient for now to catch "logout" not found issue.
    // Or check generated imports?
    // Use manual fallback for safety if uncertain.
    return apiClient.post<BaseResponse<void>>("/auth/logout");
  },
};
