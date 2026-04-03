import { api, storageKeys } from "./api";
import type { AuthResponse, User } from "../types";

export const authService = {
  async register(payload: { fullName: string; email: string; phone: string; password: string }) {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    localStorage.setItem(storageKeys.token, data.token);
    return data;
  },
  async login(payload: { email: string; password: string }) {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    localStorage.setItem(storageKeys.token, data.token);
    return data;
  },
  async getCurrentUser() {
    const { data } = await api.get<{ user: User }>("/auth/me");
    return data.user;
  },
  logout() {
    localStorage.removeItem(storageKeys.token);
  },
  hasToken() {
    return Boolean(localStorage.getItem(storageKeys.token));
  },
};
