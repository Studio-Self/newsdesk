import { pgTable, uuid, text, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { stories } from "./stories.js";
import { agents } from "./agents.js";

export const qualityScores = pgTable(
  "quality_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storyId: uuid("story_id").notNull().references(() => stories.id),
    agentId: uuid("agent_id").notNull().references(() => agents.id),
    stage: text("stage").notNull(),
    score: integer("score").notNull(),
    criteria: jsonb("criteria").$type<{
      accuracy: number;
      clarity: number;
      style: number;
      completeness: number;
    }>(),
    feedback: text("feedback"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    storyIdx: index("quality_scores_story_idx").on(table.storyId),
    agentIdx: index("quality_scores_agent_idx").on(table.agentId),
  }),
);
