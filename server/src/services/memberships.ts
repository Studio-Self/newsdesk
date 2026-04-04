import { eq, and } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { newsroomMemberships } from "@newsdesk/db";

export function membershipService(db: Db) {
  return {
    async listForUser(userId: string) {
      return db.select().from(newsroomMemberships).where(eq(newsroomMemberships.userId, userId));
    },

    async listForNewsroom(newsroomId: string) {
      return db.select().from(newsroomMemberships).where(eq(newsroomMemberships.newsroomId, newsroomId));
    },

    async get(userId: string, newsroomId: string) {
      const [row] = await db
        .select()
        .from(newsroomMemberships)
        .where(and(eq(newsroomMemberships.userId, userId), eq(newsroomMemberships.newsroomId, newsroomId)));
      return row ?? null;
    },

    async create(data: { userId: string; newsroomId: string; role?: string }) {
      const [row] = await db
        .insert(newsroomMemberships)
        .values({ userId: data.userId, newsroomId: data.newsroomId, role: data.role ?? "viewer" })
        .returning();
      return row;
    },

    async updateRole(userId: string, newsroomId: string, role: string) {
      const [row] = await db
        .update(newsroomMemberships)
        .set({ role })
        .where(and(eq(newsroomMemberships.userId, userId), eq(newsroomMemberships.newsroomId, newsroomId)))
        .returning();
      return row ?? null;
    },

    async delete(userId: string, newsroomId: string) {
      await db
        .delete(newsroomMemberships)
        .where(and(eq(newsroomMemberships.userId, userId), eq(newsroomMemberships.newsroomId, newsroomId)));
    },
  };
}
