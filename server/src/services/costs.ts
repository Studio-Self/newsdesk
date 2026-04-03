import { and, eq, sql, desc } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { costEvents, stories } from "@newsdesk/db";

export function costService(db: Db) {
  return {
    async list(newsroomId: string, limit = 100) {
      return db
        .select()
        .from(costEvents)
        .where(eq(costEvents.newsroomId, newsroomId))
        .orderBy(desc(costEvents.createdAt))
        .limit(limit);
    },

    async create(data: {
      newsroomId: string;
      agentId: string;
      storyId?: string;
      runId?: string;
      amountCents: number;
      description?: string;
    }) {
      const [row] = await db.insert(costEvents).values(data).returning();

      // Update story total cost
      if (data.storyId) {
        await db
          .update(stories)
          .set({
            costTotalCents: sql`${stories.costTotalCents} + ${data.amountCents}`,
            updatedAt: new Date(),
          })
          .where(eq(stories.id, data.storyId));
      }

      return row;
    },

    async totalForNewsroom(newsroomId: string): Promise<number> {
      const [result] = await db
        .select({ total: sql<number>`coalesce(sum(${costEvents.amountCents}), 0)::int` })
        .from(costEvents)
        .where(eq(costEvents.newsroomId, newsroomId));
      return result?.total ?? 0;
    },

    async avgCostPerArticle(newsroomId: string): Promise<number> {
      const [result] = await db
        .select({ avg: sql<number>`coalesce(avg(${stories.costTotalCents}), 0)::int` })
        .from(stories)
        .where(and(eq(stories.newsroomId, newsroomId), eq(stories.stage, "published")));
      return result?.avg ?? 0;
    },
  };
}
