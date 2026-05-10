import { create } from "zustand";
import { User } from "@/types/user"; // Using User alias from auth types which maps to user.ts
import { auth } from "@/lib/auth";

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null, // Initialize user as null, will be fetched via API
  isAuthenticated: !!auth.getToken(),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
