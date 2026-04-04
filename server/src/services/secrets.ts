import { eq, and } from "drizzle-orm";
import type { Db } from "@newsdesk/db";
import { newsroomSecrets } from "@newsdesk/db";
import crypto from "node:crypto";

const ENCRYPTION_KEY = process.env.SECRET_ENCRYPTION_KEY ?? "newsdesk-default-key-change-in-prod";

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function secretService(db: Db) {
  return {
    async list(newsroomId: string) {
      const rows = await db.select().from(newsroomSecrets).where(eq(newsroomSecrets.newsroomId, newsroomId));
      return rows.map((r) => ({ id: r.id, newsroomId: r.newsroomId, key: r.key, currentVersion: r.currentVersion, createdAt: r.createdAt, updatedAt: r.updatedAt }));
    },

    async get(newsroomId: string, key: string) {
      const rows = await db.select().from(newsroomSecrets).where(eq(newsroomSecrets.newsroomId, newsroomId));
      const row = rows.find((r) => r.key === key);
      if (!row) return null;
      return { ...row, value: decrypt(row.encryptedValue) };
    },

    async set(newsroomId: string, key: string, value: string) {
      const encrypted = encrypt(value);
      const existing = await db.select().from(newsroomSecrets).where(eq(newsroomSecrets.newsroomId, newsroomId));
      const match = existing.find((r) => r.key === key);
      if (match) {
        const [row] = await db
          .update(newsroomSecrets)
          .set({ encryptedValue: encrypted, currentVersion: match.currentVersion + 1, updatedAt: new Date() })
          .where(eq(newsroomSecrets.id, match.id))
          .returning();
        return row;
      }
      const [row] = await db.insert(newsroomSecrets).values({ newsroomId, key, encryptedValue: encrypted }).returning();
      return row;
    },

    async delete(newsroomId: string, key: string) {
      const existing = await db.select().from(newsroomSecrets).where(eq(newsroomSecrets.newsroomId, newsroomId));
      const match = existing.find((r) => r.key === key);
      if (match) {
        await db.delete(newsroomSecrets).where(eq(newsroomSecrets.id, match.id));
      }
    },
  };
}
