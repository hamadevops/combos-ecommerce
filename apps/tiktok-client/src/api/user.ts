import {
  userFindAll,
  userFindOne,
  userCreate,
  userUpdate,
  userDelete,
  userUpdateAvatar,
  userUpdateBackground,
  userUpdateProfile,
  // userUpdateUserRole?
} from "@vibe/shared";
import { request } from "@/lib/api-helper";
import {
  CreateUserDto,
  UpdateUserDto,
  User,
  UserListResponse,
  ProfileUpdateDto,
} from "@/types/user";

export const userApi = {
  // Get users list
  getList: (params?: { page?: number; limit?: number; search?: string; roleId?: number }) => {
    return request<UserListResponse>(
      userFindAll({
        query: params as any, // maps to params
      }) as any,
    );
  },

  // Get one user
  getOne: (id: number) => {
    return request<User>(
      userFindOne({
        path: { id },
      }) as any,
    );
  },

  // Create user (Admin)
  create: (data: CreateUserDto) => {
    return request<User>(
      userCreate({
        body: data as any,
      }) as any,
    );
  },

  // Update user (Admin)
  update: (id: number, data: UpdateUserDto) => {
    return request<User>(
      userUpdate({
        path: { id },
        body: data as any,
      }) as any,
    );
  },

  // Update profile (Current User) - Text only
  updateProfile: (data: ProfileUpdateDto) => {
    return request<User>(
      userUpdateProfile({
        body: data as any,
      }) as any,
    );
  },

  // Upload Avatar
  uploadAvatar: (file: File) => {
    return request<User>(
      userUpdateAvatar({
        body: {
          avatar: file,
        },
      }) as any,
    );
  },

  // Upload Background
  uploadBackground: (file: File) => {
    return request<User>(
      userUpdateBackground({
        body: {
          background: file,
        },
      }) as any,
    );
  },

  // Delete user
  delete: (id: number) => {
    return request<void>(
      userDelete({
        path: { id },
      }) as any,
    );
  },
};
