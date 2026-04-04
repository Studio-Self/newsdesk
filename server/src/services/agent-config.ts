import { eq, desc } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { agentConfigRevisions, agentRuntimeState } from "@newsdesk/db";

export function agentConfigService(db: Db) {
  return {
    async listRevisions(agentId: string) {
      return db.select().from(agentConfigRevisions).where(eq(agentConfigRevisions.agentId, agentId)).orderBy(desc(agentConfigRevisions.revision));
    },

    async createRevision(data: { agentId: string; config: Record<string, unknown>; changedBy?: string; changeNotes?: string }) {
      const existing = await this.listRevisions(data.agentId);
      const nextRevision = existing.length > 0 ? existing[0].revision + 1 : 1;
      const [row] = await db
        .insert(agentConfigRevisions)
        .values({ agentId: data.agentId, revision: nextRevision, config: data.config, changedBy: data.changedBy, changeNotes: data.changeNotes })
        .returning();
      return row;
    },

    async getRevision(agentId: string, revision: number) {
      const rows = await db.select().from(agentConfigRevisions).where(eq(agentConfigRevisions.agentId, agentId));
      return rows.find((r) => r.revision === revision) ?? null;
    },

    async getState(agentId: string) {
      const [row] = await db.select().from(agentRuntimeState).where(eq(agentRuntimeState.agentId, agentId));
      return row ?? null;
    },

    async setState(agentId: string, state: Record<string, unknown>) {
      const existing = await this.getState(agentId);
      if (existing) {
        const [row] = await db
          .update(agentRuntimeState)
          .set({ state, updatedAt: new Date() })
          .where(eq(agentRuntimeState.agentId, agentId))
          .returning();
        return row;
      }
      const [row] = await db.insert(agentRuntimeState).values({ agentId, state }).returning();
      return row;
    },

    async patchState(agentId: string, patch: Record<string, unknown>) {
      const existing = await this.getState(agentId);
      const merged = { ...(existing?.state ?? {}), ...patch };
      return this.setState(agentId, merged);
    },
  };
}
