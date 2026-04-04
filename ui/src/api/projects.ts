import type { Project, ProjectGoal, ProjectStory } from "@newsdesk/shared";
import { apiFetch } from "./client";

export const projectsApi = {
  list: (newsroomId: string, status?: string) =>
    apiFetch<Project[]>(`/newsrooms/${newsroomId}/projects${status ? `?status=${status}` : ""}`),

  get: (id: string) => apiFetch<Project>(`/projects/${id}`),

  create: (newsroomId: string, data: { title: string; slug: string; description?: string; leadAgentId?: string }) =>
    apiFetch<Project>(`/newsrooms/${newsroomId}/projects`, { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Project>) =>
    apiFetch<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch<void>(`/projects/${id}`, { method: "DELETE" }),

  listGoals: (projectId: string) => apiFetch<ProjectGoal[]>(`/projects/${projectId}/goals`),
  linkGoal: (projectId: string, goalId: string) =>
    apiFetch<ProjectGoal>(`/projects/${projectId}/goals`, { method: "POST", body: JSON.stringify({ goalId }) }),

  listStories: (projectId: string) => apiFetch<ProjectStory[]>(`/projects/${projectId}/stories`),
  linkStory: (projectId: string, storyId: string) =>
    apiFetch<ProjectStory>(`/projects/${projectId}/stories`, { method: "POST", body: JSON.stringify({ storyId }) }),
};
