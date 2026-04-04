import type { NewsroomSecret } from "@newsdesk/shared";
import { apiFetch } from "./client";

export const secretsApi = {
  list: (newsroomId: string) => apiFetch<NewsroomSecret[]>(`/newsrooms/${newsroomId}/secrets`),

  get: (newsroomId: string, key: string) => apiFetch<NewsroomSecret & { value: string }>(`/newsrooms/${newsroomId}/secrets/${key}`),

  set: (newsroomId: string, key: string, value: string) =>
    apiFetch<NewsroomSecret>(`/newsrooms/${newsroomId}/secrets/${key}`, { method: "PUT", body: JSON.stringify({ value }) }),

  delete: (newsroomId: string, key: string) => apiFetch<void>(`/newsrooms/${newsroomId}/secrets/${key}`, { method: "DELETE" }),
};
