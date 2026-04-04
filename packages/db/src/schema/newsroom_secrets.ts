import { pgTable, uuid, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { newsrooms } from "./newsrooms.js";

export const newsroomSecrets = pgTable(
  "newsroom_secrets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsroomId: uuid("newsroom_id").notNull().references(() => newsrooms.id),
    key: text("key").notNull(),
    encryptedValue: text("encrypted_value").notNull(),
    currentVersion: integer("current_version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    newsroomKeyIdx: index("newsroom_secrets_newsroom_key_idx").on(table.newsroomId, table.key),
  }),
);
