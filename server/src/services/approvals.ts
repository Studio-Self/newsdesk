import { and, eq, desc } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { approvals, stories, storyStages } from "@newsdesk/db";
import type { ApprovalStatus } from "@newsdesk/shared";
import { publishLiveEvent } from "./live-events.js";

export function approvalService(db: Db) {
  return {
    async list(filters?: { status?: string; storyId?: string }) {
      const conditions: ReturnType<typeof eq>[] = [];
      if (filters?.status) conditions.push(eq(approvals.status, filters.status));
      if (filters?.storyId) conditions.push(eq(approvals.storyId, filters.storyId));
      return db
        .select()
        .from(approvals)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(approvals.createdAt));
    },

    async getById(id: string) {
      const [row] = await db.select().from(approvals).where(eq(approvals.id, id));
      return row ?? null;
    },

    async create(data: { storyId: string; stage: string; requestedByAgentId?: string }) {
      const [row] = await db.insert(approvals).values(data).returning();

      const [story] = await db.select().from(stories).where(eq(stories.id, data.storyId));
      if (story) {
        publishLiveEvent({
          type: "approval:requested",
          newsroomId: story.newsroomId,
          data: { approvalId: row.id, storyId: data.storyId, stage: data.stage },
          timestamp: new Date().toISOString(),
        });
      }

      return row;
    },

    async decide(
      id: string,
      decision: { status: ApprovalStatus; decidedBy: string; decisionNotes?: string },
    ) {
      const [row] = await db
        .update(approvals)
        .set({
          status: decision.status,
          decidedBy: decision.decidedBy,
          decisionNotes: decision.decisionNotes,
          decidedAt: new Date(),
        })
        .where(eq(approvals.id, id))
        .returning();

      if (!row) return null;

      // If approved, advance the story to the next stage
      if (decision.status === "approved") {
        const [story] = await db.select().from(stories).where(eq(stories.id, row.storyId));
        if (story && story.stage === "review") {
          await db
            .update(stories)
            .set({ stage: "ready", updatedAt: new Date() })
            .where(eq(stories.id, story.id));

          await db.insert(storyStages).values({
            storyId: story.id,
            fromStage: "review",
            toStage: "ready",
            notes: `Approved by ${decision.decidedBy}: ${decision.decisionNotes ?? ""}`,
          });

          publishLiveEvent({
            type: "story:stage_changed",
            newsroomId: story.newsroomId,
            data: { storyId: story.id, fromStage: "review", toStage: "ready" },
            timestamp: new Date().toISOString(),
          });
        }
      }

      // If rejected, send back to copy_edit
      if (decision.status === "rejected") {
        const [story] = await db.select().from(stories).where(eq(stories.id, row.storyId));
        if (story && story.stage === "review") {
          await db
            .update(stories)
            .set({ stage: "copy_edit", updatedAt: new Date() })
            .where(eq(stories.id, story.id));

          await db.insert(storyStages).values({
            storyId: story.id,
            fromStage: "review",
            toStage: "copy_edit",
            notes: `Rejected by ${decision.decidedBy}: ${decision.decisionNotes ?? ""}`,
          });
        }
      }

      const [story] = await db.select().from(stories).where(eq(stories.id, row.storyId));
      if (story) {
        publishLiveEvent({
          type: "approval:decided",
          newsroomId: story.newsroomId,
          data: { approvalId: id, status: decision.status },
          timestamp: new Date().toISOString(),
        });
      }

      return row;
    },
  };
}
