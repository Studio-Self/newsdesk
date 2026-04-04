import type { EditorialTask, TaskComment } from "@newsdesk/shared";
import { apiFetch } from "./client";

export const tasksApi = {
  list: (newsroomId: string, filters?: { status?: string; type?: string; storyId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.type) params.set("type", filters.type);
    if (filters?.storyId) params.set("storyId", filters.storyId);
    const qs = params.toString();
    return apiFetch<EditorialTask[]>(`/newsrooms/${newsroomId}/tasks${qs ? `?${qs}` : ""}`);
  },

  get: (id: string) => apiFetch<EditorialTask>(`/tasks/${id}`),

  create: (newsroomId: string, data: { title: string; description?: string; type?: string; priority?: string; storyId?: string; assigneeAgentId?: string; labels?: string[]; dueAt?: string }) =>
    apiFetch<EditorialTask>(`/newsrooms/${newsroomId}/tasks`, { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: Partial<EditorialTask>) =>
    apiFetch<EditorialTask>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch<void>(`/tasks/${id}`, { method: "DELETE" }),

  listComments: (taskId: string) => apiFetch<TaskComment[]>(`/tasks/${taskId}/comments`),

  addComment: (taskId: string, data: { body: string; agentId?: string; authorName?: string }) =>
    apiFetch<TaskComment>(`/tasks/${taskId}/comments`, { method: "POST", body: JSON.stringify(data) }),
};
