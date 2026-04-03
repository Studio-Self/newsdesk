import { and, eq, desc, sql } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { stories, storyStages } from "@newsdesk/db";
import { STAGE_TRANSITIONS, APPROVAL_REQUIRED_STAGES } from "@newsdesk/shared";
import type { StoryStage, StoryPriority } from "@newsdesk/shared";
import { publishLiveEvent } from "./live-events.js";

export function storyService(db: Db) {
  return {
    async list(newsroomId: string, filters?: { stage?: string; beatId?: string; priority?: string }) {
      const conditions = [eq(stories.newsroomId, newsroomId)];
      if (filters?.stage) conditions.push(eq(stories.stage, filters.stage));
      if (filters?.beatId) conditions.push(eq(stories.beatId, filters.beatId));
      if (filters?.priority) conditions.push(eq(stories.priority, filters.priority));
      return db.select().from(stories).where(and(...conditions)).orderBy(desc(stories.updatedAt));
    },

    async getById(id: string) {
      const [row] = await db.select().from(stories).where(eq(stories.id, id));
      return row ?? null;
    },

    async create(data: {
      newsroomId: string;
      title: string;
      description?: string;
      beatId?: string;
      assignmentId?: string;
      priority?: StoryPriority;
    }) {
      const [row] = await db.insert(stories).values(data).returning();

      // Log initial stage
      await db.insert(storyStages).values({
        storyId: row.id,
        toStage: "pitch",
      });

      publishLiveEvent({
        type: "story:created",
        newsroomId: row.newsroomId,
        data: { storyId: row.id, title: row.title },
        timestamp: new Date().toISOString(),
      });

      return row;
    },

    async update(
      id: string,
      data: Partial<{
        title: string;
        description: string;
        body: string;
        slug: string;
        beatId: string;
        priority: StoryPriority;
        headlineOptions: string[];
        socialContent: Record<string, string>;
        sourceUrls: string[];
        wordCount: number;
        assigneeAgentId: string;
        reporterAgentId: string;
        factCheckerAgentId: string;
        copyEditorAgentId: string;
        publisherAgentId: string;
        socialEditorAgentId: string;
        costTotalCents: number;
      }>,
    ) {
      const [row] = await db
        .update(stories)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(stories.id, id))
        .returning();

      if (row) {
        publishLiveEvent({
          type: "story:updated",
          newsroomId: row.newsroomId,
          data: { storyId: row.id },
          timestamp: new Date().toISOString(),
        });
      }

      return row ?? null;
    },

    async transitionStage(
      id: string,
      toStage: StoryStage,
      opts?: { agentId?: string; notes?: string },
    ): Promise<{ success: boolean; error?: string; requiresApproval?: boolean }> {
      const story = await this.getById(id);
      if (!story) return { success: false, error: "Story not found" };

      const currentStage = story.stage as StoryStage;
      const allowed = STAGE_TRANSITIONS[currentStage];
      if (!allowed?.includes(toStage)) {
        return { success: false, error: `Cannot transition from ${currentStage} to ${toStage}` };
      }

      // Check if approval is needed at current stage
      if (APPROVAL_REQUIRED_STAGES.includes(currentStage) && toStage !== "killed") {
        // The review stage requires an approval to move forward
        return { success: false, requiresApproval: true, error: "Approval required at this stage" };
      }

      const updateData: Record<string, unknown> = {
        stage: toStage,
        updatedAt: new Date(),
      };
      if (toStage === "published") {
        updateData.publishedAt = new Date();
      }

      await db.update(stories).set(updateData).where(eq(stories.id, id));

      // Log the stage transition
      await db.insert(storyStages).values({
        storyId: id,
        fromStage: currentStage,
        toStage,
        agentId: opts?.agentId,
        notes: opts?.notes,
      });

      publishLiveEvent({
        type: "story:stage_changed",
        newsroomId: story.newsroomId,
        data: { storyId: id, fromStage: currentStage, toStage },
        timestamp: new Date().toISOString(),
      });

      return { success: true };
    },

    async getStageHistory(storyId: string) {
      return db.select().from(storyStages).where(eq(storyStages.storyId, storyId)).orderBy(storyStages.createdAt);
    },

    async getPipelineCounts(newsroomId: string) {
      const rows = await db
        .select({
          stage: stories.stage,
          count: sql<number>`count(*)::int`,
        })
        .from(stories)
        .where(eq(stories.newsroomId, newsroomId))
        .groupBy(stories.stage);

      const counts: Record<string, number> = {};
      for (const row of rows) {
        counts[row.stage] = row.count;
      }
      return counts;
    },

    async delete(id: string) {
      await db.delete(storyStages).where(eq(storyStages.storyId, id));
      await db.delete(stories).where(eq(stories.id, id));
    },
  };
}
