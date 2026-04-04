import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { newsrooms } from "./newsrooms.js";
import { users } from "./users.js";

export const invites = pgTable(
  "invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsroomId: uuid("newsroom_id").notNull().references(() => newsrooms.id),
    invitedByUserId: uuid("invited_by_user_id").notNull().references(() => users.id),
    email: text("email").notNull(),
    role: text("role").notNull().default("viewer"),
    token: text("token").notNull().unique(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    newsroomIdx: index("invites_newsroom_idx").on(table.newsroomId),
    statusIdx: index("invites_status_idx").on(table.status),
  }),
);
