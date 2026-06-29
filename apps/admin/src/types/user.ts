import { BaseResponse } from "./common";
import { Role } from "./role"; // Keep manual Role for now or update role.ts later
// Import generated types
import {
  UserResponse,
  CreateUserDto as GenCreateUserDto, // This might not be needed if we overwrite it, but keeping for reference or removing if causing error
  AdminUpdateUserDto,
  UserListResponseDto,
  AdminCreateUserDto,
  UpdateProfileDto as GenUpdateProfileDto,
} from "@projects/shared";

// Export aliases
export type CreateUserDto = AdminCreateUserDto;
export type UpdateUserDto = AdminUpdateUserDto;
export type ProfileUpdateDto = GenUpdateProfileDto;

// Extend User to match runtime and legacy usage
export type User = UserResponse & {
  role?: Role;
  roleId?: number;
  role_id?: number;
  avatar?: string;
  background?: string;
  bio?: string;
  phone?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
};

// Response wrappers
// Generated UserListResponseDto matches { data: User[], meta: ... }
// Manual UserListResponse match { data: { data: User[], meta }, meta? ... } ?
// Manual: export interface UserListResponse extends BaseResponse<UserListData> { data: UserListData }
// UserListData { data: User[], meta }
// Generated: { data: User[], meta } (Flat)
// So Generated is different structure than Manual "BaseResponse<Page>".
// We should adapt to Generated structure.
export type UserListResponse = UserListResponseDto;
