import type { DashboardSummary } from "@newsdesk/shared";
import { apiFetch } from "./client";

export const dashboardApi = {
  summary: (newsroomId: string) => apiFetch<DashboardSummary>(`/newsrooms/${newsroomId}/dashboard`),
};
