import { and, eq, avg, sql } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { qualityScores } from "@newsdesk/db";

export function qualityService(db: Db) {
  return {
    async listForStory(storyId: string) {
      return db.select().from(qualityScores).where(eq(qualityScores.storyId, storyId)).orderBy(qualityScores.createdAt);
    },

    async listForAgent(agentId: string) {
      return db.select().from(qualityScores).where(eq(qualityScores.agentId, agentId)).orderBy(qualityScores.createdAt);
    },

    async create(data: {
      storyId: string;
      agentId: string;
      stage: string;
      score: number;
      criteria?: { accuracy: number; clarity: number; style: number; completeness: number };
      feedback?: string;
    }) {
      const [row] = await db.insert(qualityScores).values(data).returning();
      return row;
    },

    async avgScoreForAgent(agentId: string): Promise<number | null> {
      const [result] = await db
        .select({ avg: sql<number>`avg(${qualityScores.score})` })
        .from(qualityScores)
        .where(eq(qualityScores.agentId, agentId));
      return result?.avg ?? null;
    },

    async avgScoreOverall(): Promise<number | null> {
      const [result] = await db.select({ avg: sql<number>`avg(${qualityScores.score})` }).from(qualityScores);
      return result?.avg ?? null;
    },
  };
}
