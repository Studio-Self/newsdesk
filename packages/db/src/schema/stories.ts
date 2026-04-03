import { pgTable, uuid, text, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { newsrooms } from "./newsrooms.js";
import { beats } from "./beats.js";
import { assignments } from "./assignments.js";
import { agents } from "./agents.js";

export const stories = pgTable(
  "stories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsroomId: uuid("newsroom_id").notNull().references(() => newsrooms.id),
    beatId: uuid("beat_id").references(() => beats.id),
    assignmentId: uuid("assignment_id").references(() => assignments.id),
    title: text("title").notNull(),
    slug: text("slug"),
    description: text("description"),
    body: text("body"),
    headlineOptions: jsonb("headline_options").$type<string[]>(),
    socialContent: jsonb("social_content").$type<Record<string, string>>(),
    stage: text("stage").notNull().default("pitch"),
    priority: text("priority").notNull().default("normal"),
    assigneeAgentId: uuid("assignee_agent_id").references(() => agents.id),
    reporterAgentId: uuid("reporter_agent_id").references(() => agents.id),
    factCheckerAgentId: uuid("fact_checker_agent_id").references(() => agents.id),
    copyEditorAgentId: uuid("copy_editor_agent_id").references(() => agents.id),
    publisherAgentId: uuid("publisher_agent_id").references(() => agents.id),
    socialEditorAgentId: uuid("social_editor_agent_id").references(() => agents.id),
    sourceUrls: jsonb("source_urls").$type<string[]>(),
    wordCount: integer("word_count"),
    costTotalCents: integer("cost_total_cents").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => ({
    newsroomStageIdx: index("stories_newsroom_stage_idx").on(table.newsroomId, table.stage),
    newsroomBeatIdx: index("stories_newsroom_beat_idx").on(table.newsroomId, table.beatId),
    newsroomPriorityIdx: index("stories_newsroom_priority_idx").on(table.newsroomId, table.priority),
    assigneeIdx: index("stories_assignee_idx").on(table.assigneeAgentId),
  }),
);
