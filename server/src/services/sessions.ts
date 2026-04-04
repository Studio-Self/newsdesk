import { eq, and, gt } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { sessions } from "@newsdesk/db";
import crypto from "node:crypto";

export function sessionService(db: Db) {
  return {
    async create(userId: string) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      const [row] = await db.insert(sessions).values({ userId, token, expiresAt }).returning();
      return row;
    },

    async validate(token: string) {
      const [row] = await db
        .select()
        .from(sessions)
        .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())));
      return row ?? null;
    },

    async delete(token: string) {
      await db.delete(sessions).where(eq(sessions.token, token));
    },

    async deleteForUser(userId: string) {
      await db.delete(sessions).where(eq(sessions.userId, userId));
    },
  };
}
