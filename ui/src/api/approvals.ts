import type { Approval, ApprovalStatus } from "@newsdesk/shared";
import { apiFetch } from "./client";

export const approvalsApi = {
  list: (status?: string) => apiFetch<Approval[]>(`/approvals${status ? `?status=${status}` : ""}`),

  get: (id: string) => apiFetch<Approval>(`/approvals/${id}`),

  create: (data: { storyId: string; stage: string }) =>
    apiFetch<Approval>("/approvals", { method: "POST", body: JSON.stringify(data) }),

  decide: (id: string, data: { status: ApprovalStatus; decidedBy: string; decisionNotes?: string }) =>
    apiFetch<Approval>(`/approvals/${id}/decide`, { method: "POST", body: JSON.stringify(data) }),
};
