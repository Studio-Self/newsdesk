import { eq, desc } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { routines } from "@newsdesk/db";

export function routineService(db: Db) {
  return {
    async list(newsroomId: string) {
      return db.select().from(routines).where(eq(routines.newsroomId, newsroomId)).orderBy(desc(routines.createdAt));
    },

    async getById(id: string) {
      const [row] = await db.select().from(routines).where(eq(routines.id, id));
      return row ?? null;
    },

    async create(data: {
      newsroomId: string;
      name: string;
      description?: string;
      schedule: string;
      agentId?: string;
      action: string;
      actionConfig?: Record<string, unknown>;
    }) {
      const [row] = await db.insert(routines).values(data).returning();
      return row;
    },

    async update(id: string, data: Partial<{
      name: string;
      description: string;
      schedule: string;
      agentId: string;
      action: string;
      actionConfig: Record<string, unknown>;
      enabled: boolean;
      lastRunAt: Date;
      nextRunAt: Date;
    }>) {
      const [row] = await db.update(routines).set({ ...data, updatedAt: new Date() }).where(eq(routines.id, id)).returning();
      return row ?? null;
    },

    async delete(id: string) {
      await db.delete(routines).where(eq(routines.id, id));
    },

    async listEnabled() {
      const rows = await db.select().from(routines).where(eq(routines.enabled, true));
      return rows;
    },
  };
}
