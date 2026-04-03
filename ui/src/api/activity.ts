import type { ActivityLogEntry } from "@newsdesk/shared";
import { apiFetch } from "./client";

export const activityApi = {
  list: (newsroomId: string, limit = 50) =>
    apiFetch<ActivityLogEntry[]>(`/newsrooms/${newsroomId}/activity?limit=${limit}`),
};
