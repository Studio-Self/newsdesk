import type { CostEvent } from "@newsdesk/shared";
import { apiFetch } from "./client";

export const costsApi = {
  list: (newsroomId: string) => apiFetch<CostEvent[]>(`/newsrooms/${newsroomId}/costs`),
  totals: (newsroomId: string) =>
    apiFetch<{ totalCents: number; avgCostPerArticleCents: number }>(`/newsrooms/${newsroomId}/costs/total`),
};
