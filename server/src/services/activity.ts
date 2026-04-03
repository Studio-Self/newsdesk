import { eq, desc } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { activityLog } from "@newsdesk/db";
import { publishLiveEvent } from "./live-events.js";

export function activityService(db: Db) {
  return {
    async list(newsroomId: string, limit = 50) {
      return db
        .select()
        .from(activityLog)
        .where(eq(activityLog.newsroomId, newsroomId))
        .orderBy(desc(activityLog.createdAt))
        .limit(limit);
    },

    async log(data: {
      newsroomId: string;
      type: string;
      storyId?: string;
      agentId?: string;
      data?: Record<string, unknown>;
    }) {
      const [row] = await db
        .insert(activityLog)
        .values({ ...data, data: data.data ?? {} })
        .returning();

      publishLiveEvent({
        type: "activity:new",
        newsroomId: data.newsroomId,
        data: { activityId: row.id, type: data.type },
        timestamp: new Date().toISOString(),
      });

      return row;
    },
  };
}
