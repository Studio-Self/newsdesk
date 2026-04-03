import type { Agent } from "@newsdesk/shared";
import { apiFetch } from "./client";

export const agentsApi = {
  list: (newsroomId: string) => apiFetch<Agent[]>(`/newsrooms/${newsroomId}/agents`),

  get: (id: string) => apiFetch<Agent>(`/agents/${id}`),

  create: (newsroomId: string, data: { name: string; role: string; title?: string; icon?: string }) =>
    apiFetch<Agent>(`/newsrooms/${newsroomId}/agents`, { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Agent>) =>
    apiFetch<Agent>(`/agents/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch<void>(`/agents/${id}`, { method: "DELETE" }),
};
