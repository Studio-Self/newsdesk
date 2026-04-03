import { eq } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { newsrooms } from "@newsdesk/db";

export function newsroomService(db: Db) {
  return {
    async list() {
      return db.select().from(newsrooms).orderBy(newsrooms.createdAt);
    },

    async getById(id: string) {
      const [row] = await db.select().from(newsrooms).where(eq(newsrooms.id, id));
      return row ?? null;
    },

    async getBySlug(slug: string) {
      const [row] = await db.select().from(newsrooms).where(eq(newsrooms.slug, slug));
      return row ?? null;
    },

    async create(data: { name: string; slug: string; description?: string }) {
      const [row] = await db.insert(newsrooms).values(data).returning();
      return row;
    },

    async update(id: string, data: { name?: string; description?: string }) {
      const [row] = await db
        .update(newsrooms)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(newsrooms.id, id))
        .returning();
      return row ?? null;
    },

    async delete(id: string) {
      await db.delete(newsrooms).where(eq(newsrooms.id, id));
    },
  };
}
