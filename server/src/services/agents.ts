import { and, eq } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { agents } from "@newsdesk/db";
import type { AgentRole } from "@newsdesk/shared";

export function agentService(db: Db) {
  return {
    async list(newsroomId: string) {
      return db.select().from(agents).where(eq(agents.newsroomId, newsroomId)).orderBy(agents.createdAt);
    },

    async getById(id: string) {
      const [row] = await db.select().from(agents).where(eq(agents.id, id));
      return row ?? null;
    },

    async listByRole(newsroomId: string, role: AgentRole) {
      return db
        .select()
        .from(agents)
        .where(and(eq(agents.newsroomId, newsroomId), eq(agents.role, role)));
    },

    async create(data: {
      newsroomId: string;
      name: string;
      role: AgentRole;
      title?: string;
      icon?: string;
      adapterType?: string;
      adapterConfig?: Record<string, unknown>;
      budgetMonthlyCents?: number;
    }) {
      const [row] = await db.insert(agents).values(data).returning();
      return row;
    },

    async update(
      id: string,
      data: Partial<{
        name: string;
        role: AgentRole;
        title: string;
        icon: string;
        status: string;
        adapterConfig: Record<string, unknown>;
        budgetMonthlyCents: number;
        spentMonthlyCents: number;
        lastHeartbeatAt: Date;
      }>,
    ) {
      const [row] = await db
        .update(agents)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(agents.id, id))
        .returning();
      return row ?? null;
    },

    async delete(id: string) {
      await db.delete(agents).where(eq(agents.id, id));
    },
  };
}
