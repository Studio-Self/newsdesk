import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { newsrooms } from "./newsrooms.js";
import { stories } from "./stories.js";
import { agents } from "./agents.js";

export const activityLog = pgTable(
  "activity_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsroomId: uuid("newsroom_id").notNull().references(() => newsrooms.id),
    type: text("type").notNull(),
    storyId: uuid("story_id").references(() => stories.id),
    agentId: uuid("agent_id").references(() => agents.id),
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    newsroomIdx: index("activity_log_newsroom_idx").on(table.newsroomId),
    typeIdx: index("activity_log_type_idx").on(table.newsroomId, table.type),
  }),
);
