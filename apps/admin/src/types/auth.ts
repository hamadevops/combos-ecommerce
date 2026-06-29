import {
  UserResponse as GenUser, // Assuming User is exported
  AuthLoginData,
  UserRegisterData,
  UserUpdateProfileData,
  UserChangePasswordData,
  LoginResponse as GenLoginResponse,
  LoginResponseDto,
} from "@projects/shared";
// Map DTOs.
// Generated SDK passes DTOs as 'body'.
// We use Request/Response DTO types.
export type LoginDto = AuthLoginData["body"];
export type RegisterDto = UserRegisterData["body"];
export type UpdateProfileDto = UserUpdateProfileData["body"]; // might be FormData or Object
export type ChangePasswordDto = UserChangePasswordData["body"];
export type LoginResponse = GenLoginResponse;

// We re-export User (extended if needed) from user.ts usually,
// but auth.ts had UserProfile alias.
import { User } from "./user";
export type UserProfile = User;
