import { eq, and, desc } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { editorialTasks, taskComments } from "@newsdesk/db";

export function taskService(db: Db) {
  return {
    async list(newsroomId: string, filters?: { status?: string; type?: string; assigneeAgentId?: string; storyId?: string }) {
      let query = db.select().from(editorialTasks).where(eq(editorialTasks.newsroomId, newsroomId)).orderBy(desc(editorialTasks.createdAt)).$dynamic();
      // Apply filters in-memory for simplicity since drizzle dynamic where chaining is verbose
      const rows = await query;
      return rows.filter((r) => {
        if (filters?.status && r.status !== filters.status) return false;
        if (filters?.type && r.type !== filters.type) return false;
        if (filters?.assigneeAgentId && r.assigneeAgentId !== filters.assigneeAgentId) return false;
        if (filters?.storyId && r.storyId !== filters.storyId) return false;
        return true;
      });
    },

    async getById(id: string) {
      const [row] = await db.select().from(editorialTasks).where(eq(editorialTasks.id, id));
      return row ?? null;
    },

    async create(data: {
      newsroomId: string;
      title: string;
      description?: string;
      type?: string;
      priority?: string;
      storyId?: string;
      assigneeAgentId?: string;
      createdByAgentId?: string;
      labels?: string[];
      dueAt?: string;
    }) {
      const [row] = await db
        .insert(editorialTasks)
        .values({
          newsroomId: data.newsroomId,
          title: data.title,
          description: data.description,
          type: data.type ?? "general",
          priority: data.priority ?? "normal",
          storyId: data.storyId,
          assigneeAgentId: data.assigneeAgentId,
          createdByAgentId: data.createdByAgentId,
          labels: data.labels ?? [],
          dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
        })
        .returning();
      return row;
    },

    async update(id: string, data: Partial<{
      title: string;
      description: string;
      type: string;
      status: string;
      priority: string;
      assigneeAgentId: string;
      labels: string[];
      dueAt: string;
    }>) {
      const values: Record<string, unknown> = { ...data, updatedAt: new Date() };
      if (data.dueAt) values.dueAt = new Date(data.dueAt);
      if (data.status === "completed") values.completedAt = new Date();
      const [row] = await db.update(editorialTasks).set(values).where(eq(editorialTasks.id, id)).returning();
      return row ?? null;
    },

    async delete(id: string) {
      await db.delete(taskComments).where(eq(taskComments.taskId, id));
      await db.delete(editorialTasks).where(eq(editorialTasks.id, id));
    },

    async listComments(taskId: string) {
      return db.select().from(taskComments).where(eq(taskComments.taskId, taskId)).orderBy(taskComments.createdAt);
    },

    async addComment(data: { taskId: string; agentId?: string; authorName?: string; body: string }) {
      const [row] = await db.insert(taskComments).values(data).returning();
      return row;
    },
  };
}
