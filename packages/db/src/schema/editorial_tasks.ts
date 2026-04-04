import { pgTable, uuid, text, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";
import { newsrooms } from "./newsrooms.js";
import { agents } from "./agents.js";
import { stories } from "./stories.js";

export const editorialTasks = pgTable(
  "editorial_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsroomId: uuid("newsroom_id").notNull().references(() => newsrooms.id),
    title: text("title").notNull(),
    description: text("description"),
    type: text("type").notNull().default("general"),
    status: text("status").notNull().default("open"),
    priority: text("priority").notNull().default("normal"),
    storyId: uuid("story_id").references(() => stories.id),
    assigneeAgentId: uuid("assignee_agent_id").references(() => agents.id),
    createdByAgentId: uuid("created_by_agent_id").references(() => agents.id),
    labels: jsonb("labels").$type<string[]>().notNull().default([]),
    dueAt: timestamp("due_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    newsroomStatusIdx: index("editorial_tasks_newsroom_status_idx").on(table.newsroomId, table.status),
    newsroomTypeIdx: index("editorial_tasks_newsroom_type_idx").on(table.newsroomId, table.type),
    assigneeIdx: index("editorial_tasks_assignee_idx").on(table.assigneeAgentId),
    storyIdx: index("editorial_tasks_story_idx").on(table.storyId),
  }),
);
