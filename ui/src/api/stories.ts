import type { Story, StoryStageLog } from "@newsdesk/shared";
import { apiFetch } from "./client";

export const storiesApi = {
  list: (newsroomId: string, filters?: { stage?: string; beatId?: string }) =>
    apiFetch<Story[]>(`/newsrooms/${newsroomId}/stories${filters?.stage ? `?stage=${filters.stage}` : ""}`),

  get: (id: string) => apiFetch<Story>(`/stories/${id}`),

  create: (newsroomId: string, data: { title: string; description?: string; beatId?: string; priority?: string }) =>
    apiFetch<Story>(`/newsrooms/${newsroomId}/stories`, { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Story>) =>
    apiFetch<Story>(`/stories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  transition: (id: string, stage: string, opts?: { agentId?: string; notes?: string }) =>
    apiFetch<{ success: boolean }>(`/stories/${id}/transition`, { method: "POST", body: JSON.stringify({ stage, ...opts }) }),

  getStages: (id: string) => apiFetch<StoryStageLog[]>(`/stories/${id}/stages`),

  delete: (id: string) => apiFetch<void>(`/stories/${id}`, { method: "DELETE" }),
};
