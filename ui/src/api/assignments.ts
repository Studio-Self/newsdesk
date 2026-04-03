import type { Assignment } from "@newsdesk/shared";
import { apiFetch } from "./client";

export const assignmentsApi = {
  list: (newsroomId: string) => apiFetch<Assignment[]>(`/newsrooms/${newsroomId}/assignments`),
  get: (id: string) => apiFetch<Assignment>(`/assignments/${id}`),
  create: (newsroomId: string, data: { title: string; description?: string; beatId?: string; priority?: string }) =>
    apiFetch<Assignment>(`/newsrooms/${newsroomId}/assignments`, { method: "POST", body: JSON.stringify(data) }),
};
