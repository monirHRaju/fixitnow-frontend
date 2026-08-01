import { create } from "zustand";
import type { User } from "./types";

// Cookie helpers (for middleware access)
const TOKEN_COOKIE = "fixitnow_token";

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

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
    setCookie(TOKEN_COOKIE, token);
    set({ user, token, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem("fixitnow_token");
    localStorage.removeItem("fixitnow_user");
    removeCookie(TOKEN_COOKIE);
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
        // Sync cookie in case it was cleared
        setCookie(TOKEN_COOKIE, token);
        set({ user, token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
