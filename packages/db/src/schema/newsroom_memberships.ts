import { pgTable, uuid, text, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { newsrooms } from "./newsrooms.js";

export const newsroomMemberships = pgTable(
  "newsroom_memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    newsroomId: uuid("newsroom_id").notNull().references(() => newsrooms.id),
    role: text("role").notNull().default("viewer"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userNewsroomIdx: uniqueIndex("memberships_user_newsroom_idx").on(table.userId, table.newsroomId),
    newsroomIdx: index("memberships_newsroom_idx").on(table.newsroomId),
  }),
);
