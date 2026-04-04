import type { Goal } from "@newsdesk/shared";
import { apiFetch } from "./client";

export const goalsApi = {
  list: (newsroomId: string, status?: string) =>
    apiFetch<Goal[]>(`/newsrooms/${newsroomId}/goals${status ? `?status=${status}` : ""}`),

  get: (id: string) => apiFetch<Goal>(`/goals/${id}`),

  create: (newsroomId: string, data: { title: string; description?: string; parentGoalId?: string; targetDate?: string }) =>
    apiFetch<Goal>(`/newsrooms/${newsroomId}/goals`, { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Goal>) =>
    apiFetch<Goal>(`/goals/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch<void>(`/goals/${id}`, { method: "DELETE" }),
};
