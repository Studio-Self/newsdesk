import { pgTable, uuid, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { newsrooms } from "./newsrooms.js";

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsroomId: uuid("newsroom_id").notNull().references(() => newsrooms.id),
    parentGoalId: uuid("parent_goal_id"),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").notNull().default("active"),
    targetDate: timestamp("target_date", { withTimezone: true }),
    progressPct: integer("progress_pct").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    newsroomIdx: index("goals_newsroom_idx").on(table.newsroomId),
    parentIdx: index("goals_parent_idx").on(table.parentGoalId),
    statusIdx: index("goals_status_idx").on(table.newsroomId, table.status),
  }),
);
