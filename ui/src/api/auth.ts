import type { User } from "@newsdesk/shared";
import { apiFetch } from "./client";

export interface AuthResponse {
  user: Pick<User, "id" | "email" | "name" | "avatarUrl">;
  token: string;
}

export const authApi = {
  register: (data: { email: string; name: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  logout: () => apiFetch<void>("/auth/logout", { method: "POST" }),

  me: () => apiFetch<Pick<User, "id" | "email" | "name" | "avatarUrl">>("/auth/me"),
};
