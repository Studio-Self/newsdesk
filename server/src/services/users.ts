import { eq } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { users } from "@newsdesk/db";
import crypto from "node:crypto";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const result = crypto.scryptSync(password, salt, 64).toString("hex");
  return hash === result;
}

export function userService(db: Db) {
  return {
    async list() {
      return db.select().from(users).orderBy(users.createdAt);
    },

    async getById(id: string) {
      const [row] = await db.select().from(users).where(eq(users.id, id));
      return row ?? null;
    },

    async getByEmail(email: string) {
      const [row] = await db.select().from(users).where(eq(users.email, email));
      return row ?? null;
    },

    async create(data: { email: string; name: string; password: string }) {
      const passwordHash = hashPassword(data.password);
      const [row] = await db.insert(users).values({ email: data.email, name: data.name, passwordHash }).returning();
      return row;
    },

    async authenticate(email: string, password: string) {
      const user = await this.getByEmail(email);
      if (!user) return null;
      if (!verifyPassword(password, user.passwordHash)) return null;
      return user;
    },

    async update(id: string, data: { name?: string; avatarUrl?: string; isActive?: boolean }) {
      const [row] = await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id)).returning();
      return row ?? null;
    },
  };
}
