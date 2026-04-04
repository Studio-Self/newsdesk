import { eq, desc } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { documents, documentRevisions } from "@newsdesk/db";

export function documentService(db: Db) {
  return {
    async list(newsroomId: string, category?: string) {
      const rows = await db.select().from(documents).where(eq(documents.newsroomId, newsroomId)).orderBy(desc(documents.updatedAt));
      if (category) return rows.filter((r) => r.category === category);
      return rows;
    },

    async getById(id: string) {
      const [row] = await db.select().from(documents).where(eq(documents.id, id));
      return row ?? null;
    },

    async create(data: { newsroomId: string; title: string; slug: string; body?: string; category?: string }) {
      const [row] = await db.insert(documents).values(data).returning();
      // Create initial revision
      await db.insert(documentRevisions).values({
        documentId: row.id,
        revision: 1,
        body: data.body ?? "",
        changedBy: null,
        changeNotes: "Initial version",
      });
      return row;
    },

    async update(id: string, data: { title?: string; body?: string; category?: string; changedBy?: string; changeNotes?: string }) {
      const doc = await this.getById(id);
      if (!doc) return null;

      const newRevision = doc.currentRevision + 1;
      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (data.title) updateData.title = data.title;
      if (data.category) updateData.category = data.category;
      if (data.body !== undefined) {
        updateData.body = data.body;
        updateData.currentRevision = newRevision;
        await db.insert(documentRevisions).values({
          documentId: id,
          revision: newRevision,
          body: data.body,
          changedBy: data.changedBy,
          changeNotes: data.changeNotes,
        });
      }

      const [row] = await db.update(documents).set(updateData).where(eq(documents.id, id)).returning();
      return row ?? null;
    },

    async delete(id: string) {
      await db.delete(documentRevisions).where(eq(documentRevisions.documentId, id));
      await db.delete(documents).where(eq(documents.id, id));
    },

    async listRevisions(documentId: string) {
      return db.select().from(documentRevisions).where(eq(documentRevisions.documentId, documentId)).orderBy(desc(documentRevisions.revision));
    },

    async getRevision(documentId: string, revision: number) {
      const rows = await db.select().from(documentRevisions).where(eq(documentRevisions.documentId, documentId));
      return rows.find((r) => r.revision === revision) ?? null;
    },
  };
}
