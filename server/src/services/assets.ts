import { eq, desc } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { assets } from "@newsdesk/db";

export function assetService(db: Db) {
  return {
    async list(newsroomId: string, storyId?: string) {
      const rows = await db.select().from(assets).where(eq(assets.newsroomId, newsroomId)).orderBy(desc(assets.createdAt));
      if (storyId) return rows.filter((r) => r.storyId === storyId);
      return rows;
    },

    async getById(id: string) {
      const [row] = await db.select().from(assets).where(eq(assets.id, id));
      return row ?? null;
    },

    async create(data: {
      newsroomId: string;
      storyId?: string;
      filename: string;
      mimeType: string;
      sizeBytes: number;
      storagePath: string;
      altText?: string;
      caption?: string;
      uploadedBy?: string;
    }) {
      const [row] = await db.insert(assets).values(data).returning();
      return row;
    },

    async delete(id: string) {
      await db.delete(assets).where(eq(assets.id, id));
    },
  };
}
