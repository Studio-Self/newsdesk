import type { Routine } from "@newsdesk/shared";
import { apiFetch } from "./client";

export const routinesApi = {
  list: (newsroomId: string) => apiFetch<Routine[]>(`/newsrooms/${newsroomId}/routines`),

  get: (id: string) => apiFetch<Routine>(`/routines/${id}`),

  create: (newsroomId: string, data: { name: string; schedule: string; action: string; description?: string; agentId?: string; actionConfig?: Record<string, unknown> }) =>
    apiFetch<Routine>(`/newsrooms/${newsroomId}/routines`, { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Routine>) =>
    apiFetch<Routine>(`/routines/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch<void>(`/routines/${id}`, { method: "DELETE" }),
};
