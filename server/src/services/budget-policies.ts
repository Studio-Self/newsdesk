import { eq, desc } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { budgetPolicies, budgetIncidents } from "@newsdesk/db";

export function budgetPolicyService(db: Db) {
  return {
    async list(newsroomId: string) {
      return db.select().from(budgetPolicies).where(eq(budgetPolicies.newsroomId, newsroomId)).orderBy(desc(budgetPolicies.createdAt));
    },

    async getById(id: string) {
      const [row] = await db.select().from(budgetPolicies).where(eq(budgetPolicies.id, id));
      return row ?? null;
    },

    async create(data: {
      newsroomId: string;
      name: string;
      scope?: string;
      scopeId?: string;
      limitCents: number;
      periodDays?: number;
      alertThresholdPct?: number;
    }) {
      const [row] = await db.insert(budgetPolicies).values(data).returning();
      return row;
    },

    async update(id: string, data: Partial<{ name: string; limitCents: number; periodDays: number; alertThresholdPct: number; enabled: boolean }>) {
      const [row] = await db.update(budgetPolicies).set({ ...data, updatedAt: new Date() }).where(eq(budgetPolicies.id, id)).returning();
      return row ?? null;
    },

    async delete(id: string) {
      await db.delete(budgetPolicies).where(eq(budgetPolicies.id, id));
    },

    async listIncidents(newsroomId: string) {
      return db.select().from(budgetIncidents).where(eq(budgetIncidents.newsroomId, newsroomId)).orderBy(desc(budgetIncidents.createdAt));
    },

    async recordIncident(data: { newsroomId: string; policyId?: string; agentId?: string; type: string; amountCents: number; message?: string }) {
      const [row] = await db.insert(budgetIncidents).values(data).returning();
      return row;
    },
  };
}
