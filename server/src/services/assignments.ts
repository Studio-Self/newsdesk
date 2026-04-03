import { and, eq } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { assignments } from "@newsdesk/db";

export function assignmentService(db: Db) {
  return {
    async list(newsroomId: string, status?: string) {
      const conditions = [eq(assignments.newsroomId, newsroomId)];
      if (status) conditions.push(eq(assignments.status, status));
      return db.select().from(assignments).where(and(...conditions)).orderBy(assignments.createdAt);
    },

    async getById(id: string) {
      const [row] = await db.select().from(assignments).where(eq(assignments.id, id));
      return row ?? null;
    },

    async create(data: {
      newsroomId: string;
      title: string;
      description?: string;
      beatId?: string;
      assignedByAgentId?: string;
      priority?: string;
    }) {
      const [row] = await db.insert(assignments).values(data).returning();
      return row;
    },

    async update(id: string, data: Partial<{ title: string; description: string; status: string; priority: string }>) {
      const [row] = await db
        .update(assignments)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(assignments.id, id))
        .returning();
      return row ?? null;
    },
  };
}
