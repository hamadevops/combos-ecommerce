import { authGetProfile, userUpdateProfile, userChangePassword } from "@vibe/shared";
import { request } from "@/lib/api-helper";
import { User, UpdateUserDto } from "@/types/user"; // Using User from types/user which aliases generated
import { ChangePasswordDto } from "@/types/auth";
import { BaseResponse } from "@/types/common";

export const profileApi = {
  // Get current user profile
  getProfile: () => {
    return request<User>(authGetProfile() as any);
  },

  // Update profile info
  updateProfile: (data: UpdateUserDto) => {
    return request<User>(
      userUpdateProfile({
        body: data as any,
      }) as any,
    );
  },

  // Change password
  changePassword: (data: ChangePasswordDto) => {
    return request<void>(
      userChangePassword({
        body: data,
      }) as any,
    );
  },
};
