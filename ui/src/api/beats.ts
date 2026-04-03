import type { Beat } from "@newsdesk/shared";
import { apiFetch } from "./client";

export const beatsApi = {
  list: (newsroomId: string) => apiFetch<Beat[]>(`/newsrooms/${newsroomId}/beats`),
  get: (id: string) => apiFetch<Beat>(`/beats/${id}`),
  create: (newsroomId: string, data: { name: string; slug: string; description?: string }) =>
    apiFetch<Beat>(`/newsrooms/${newsroomId}/beats`, { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Beat>) =>
    apiFetch<Beat>(`/beats/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<void>(`/beats/${id}`, { method: "DELETE" }),
};
