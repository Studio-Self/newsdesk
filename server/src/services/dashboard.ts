import { and, eq, sql, gte } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { stories, agents, approvals, costEvents, qualityScores } from "@newsdesk/db";
import type { DashboardSummary } from "@newsdesk/shared";

export function dashboardService(db: Db) {
  return {
    async summary(newsroomId: string): Promise<DashboardSummary> {
      // Pipeline counts
      const stageRows = await db
        .select({ stage: stories.stage, count: sql<number>`count(*)::int` })
        .from(stories)
        .where(eq(stories.newsroomId, newsroomId))
        .groupBy(stories.stage);
      const pipelineCounts: Record<string, number> = {};
      for (const row of stageRows) pipelineCounts[row.stage] = row.count;

      // Agent counts
      const [agentCounts] = await db
        .select({
          total: sql<number>`count(*)::int`,
          active: sql<number>`count(*) filter (where ${agents.status} = 'working')::int`,
        })
        .from(agents)
        .where(eq(agents.newsroomId, newsroomId));

      // Pending approvals
      const [approvalCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(approvals)
        .where(eq(approvals.status, "pending"));

      // Total cost
      const [costResult] = await db
        .select({ total: sql<number>`coalesce(sum(${costEvents.amountCents}), 0)::int` })
        .from(costEvents)
        .where(eq(costEvents.newsroomId, newsroomId));

      // Avg cost per article
      const [avgCost] = await db
        .select({ avg: sql<number>`coalesce(avg(${stories.costTotalCents}), 0)::int` })
        .from(stories)
        .where(and(eq(stories.newsroomId, newsroomId), eq(stories.stage, "published")));

      // Stories published today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [publishedToday] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(stories)
        .where(
          and(
            eq(stories.newsroomId, newsroomId),
            eq(stories.stage, "published"),
            gte(stories.publishedAt, today),
          ),
        );

      // Avg quality score
      const [avgQuality] = await db
        .select({ avg: sql<number>`coalesce(avg(${qualityScores.score}), 0)::int` })
        .from(qualityScores);

      return {
        pipelineCounts,
        activeAgents: agentCounts?.active ?? 0,
        totalAgents: agentCounts?.total ?? 0,
        pendingApprovals: approvalCount?.count ?? 0,
        totalCostCents: costResult?.total ?? 0,
        avgCostPerArticleCents: avgCost?.avg ?? 0,
        storiesPublishedToday: publishedToday?.count ?? 0,
        avgQualityScore: avgQuality?.avg ?? 0,
      };
    },
  };
}
