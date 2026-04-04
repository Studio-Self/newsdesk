export const DOCUMENT_CATEGORIES = [
  "general",
  "style_guide",
  "editorial_policy",
  "beat_briefing",
  "source_database",
  "story_template",
  "research",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export interface Document {
  id: string;
  newsroomId: string;
  title: string;
  slug: string;
  body: string;
  category: DocumentCategory;
  currentRevision: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRevision {
  id: string;
  documentId: string;
  revision: number;
  body: string;
  changedBy: string | null;
  changeNotes: string | null;
  createdAt: string;
}
