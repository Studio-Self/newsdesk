import { eq } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { beats } from "@newsdesk/db";

export function beatService(db: Db) {
  return {
    async list(newsroomId: string) {
      return db.select().from(beats).where(eq(beats.newsroomId, newsroomId)).orderBy(beats.name);
    },

    async getById(id: string) {
      const [row] = await db.select().from(beats).where(eq(beats.id, id));
      return row ?? null;
    },

    async create(data: { newsroomId: string; name: string; slug: string; description?: string }) {
      const [row] = await db.insert(beats).values(data).returning();
      return row;
    },

    async update(id: string, data: { name?: string; description?: string }) {
      const [row] = await db
        .update(beats)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(beats.id, id))
        .returning();
      return row ?? null;
    },

    async delete(id: string) {
      await db.delete(beats).where(eq(beats.id, id));
    },
  };
}
