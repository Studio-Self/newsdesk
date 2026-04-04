import { eq, desc } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { goals } from "@newsdesk/db";

export function goalService(db: Db) {
  return {
    async list(newsroomId: string, status?: string) {
      const rows = await db.select().from(goals).where(eq(goals.newsroomId, newsroomId)).orderBy(desc(goals.createdAt));
      if (status) return rows.filter((r) => r.status === status);
      return rows;
    },

    async getById(id: string) {
      const [row] = await db.select().from(goals).where(eq(goals.id, id));
      return row ?? null;
    },

    async create(data: { newsroomId: string; title: string; description?: string; parentGoalId?: string; targetDate?: string }) {
      const [row] = await db
        .insert(goals)
        .values({
          newsroomId: data.newsroomId,
          title: data.title,
          description: data.description,
          parentGoalId: data.parentGoalId,
          targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        })
        .returning();
      return row;
    },

    async update(id: string, data: Partial<{ title: string; description: string; status: string; progressPct: number; targetDate: string }>) {
      const values: Record<string, unknown> = { ...data, updatedAt: new Date() };
      if (data.targetDate) values.targetDate = new Date(data.targetDate);
      const [row] = await db.update(goals).set(values).where(eq(goals.id, id)).returning();
      return row ?? null;
    },

    async delete(id: string) {
      await db.delete(goals).where(eq(goals.id, id));
    },
  };
}
