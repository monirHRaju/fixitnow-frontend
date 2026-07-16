import { create } from "zustand";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  setAuth: (user, token) => {
    localStorage.setItem("fixitnow_token", token);
    localStorage.setItem("fixitnow_user", JSON.stringify(user));
    set({ user, token, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem("fixitnow_token");
    localStorage.removeItem("fixitnow_user");
    set({ user: null, token: null, isLoading: false });
    window.location.href = "/login";
  },
  setUser: (user) => {
    localStorage.setItem("fixitnow_user", JSON.stringify(user));
    set({ user });
  },
  setLoading: (isLoading) => set({ isLoading }),
  initialize: () => {
    try {
      const token = localStorage.getItem("fixitnow_token");
      const userStr = localStorage.getItem("fixitnow_user");
      if (token && userStr) {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
