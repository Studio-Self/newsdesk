import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { newsrooms } from "./newsrooms.js";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsroomId: uuid("newsroom_id").notNull().references(() => newsrooms.id),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    status: text("status").notNull().default("active"),
    leadAgentId: uuid("lead_agent_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    newsroomIdx: index("projects_newsroom_idx").on(table.newsroomId),
    newsroomStatusIdx: index("projects_newsroom_status_idx").on(table.newsroomId, table.status),
    slugIdx: index("projects_slug_idx").on(table.newsroomId, table.slug),
  }),
);
