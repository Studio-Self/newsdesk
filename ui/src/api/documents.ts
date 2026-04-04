import type { Document, DocumentRevision } from "@newsdesk/shared";
import { apiFetch } from "./client";

export const documentsApi = {
  list: (newsroomId: string, category?: string) =>
    apiFetch<Document[]>(`/newsrooms/${newsroomId}/documents${category ? `?category=${category}` : ""}`),

  get: (id: string) => apiFetch<Document>(`/documents/${id}`),

  create: (newsroomId: string, data: { title: string; slug: string; body?: string; category?: string }) =>
    apiFetch<Document>(`/newsrooms/${newsroomId}/documents`, { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: { title?: string; body?: string; category?: string; changedBy?: string; changeNotes?: string }) =>
    apiFetch<Document>(`/documents/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch<void>(`/documents/${id}`, { method: "DELETE" }),

  listRevisions: (id: string) => apiFetch<DocumentRevision[]>(`/documents/${id}/revisions`),

  getRevision: (id: string, revision: number) => apiFetch<DocumentRevision>(`/documents/${id}/revisions/${revision}`),
};
