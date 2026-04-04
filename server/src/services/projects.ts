import { eq, desc } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { projects, projectGoals, projectStories } from "@newsdesk/db";

export function projectService(db: Db) {
  return {
    async list(newsroomId: string, status?: string) {
      const rows = await db.select().from(projects).where(eq(projects.newsroomId, newsroomId)).orderBy(desc(projects.createdAt));
      if (status) return rows.filter((r) => r.status === status);
      return rows;
    },

    async getById(id: string) {
      const [row] = await db.select().from(projects).where(eq(projects.id, id));
      return row ?? null;
    },

    async create(data: { newsroomId: string; title: string; slug: string; description?: string; leadAgentId?: string }) {
      const [row] = await db.insert(projects).values(data).returning();
      return row;
    },

    async update(id: string, data: Partial<{ title: string; description: string; status: string; slug: string; leadAgentId: string }>) {
      const [row] = await db.update(projects).set({ ...data, updatedAt: new Date() }).where(eq(projects.id, id)).returning();
      return row ?? null;
    },

    async delete(id: string) {
      await db.delete(projectGoals).where(eq(projectGoals.projectId, id));
      await db.delete(projectStories).where(eq(projectStories.projectId, id));
      await db.delete(projects).where(eq(projects.id, id));
    },

    async linkGoal(projectId: string, goalId: string) {
      const [row] = await db.insert(projectGoals).values({ projectId, goalId }).returning();
      return row;
    },

    async unlinkGoal(projectId: string, goalId: string) {
      await db.delete(projectGoals).where(eq(projectGoals.projectId, projectId));
    },

    async listGoals(projectId: string) {
      return db.select().from(projectGoals).where(eq(projectGoals.projectId, projectId));
    },

    async linkStory(projectId: string, storyId: string) {
      const [row] = await db.insert(projectStories).values({ projectId, storyId }).returning();
      return row;
    },

    async unlinkStory(projectId: string, storyId: string) {
      await db.delete(projectStories).where(eq(projectStories.projectId, projectId));
    },

    async listStories(projectId: string) {
      return db.select().from(projectStories).where(eq(projectStories.projectId, projectId));
    },
  };
}
