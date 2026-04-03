import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { stories } from "./stories.js";
import { agents } from "./agents.js";

export const storyStages = pgTable(
  "story_stages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storyId: uuid("story_id").notNull().references(() => stories.id),
    fromStage: text("from_stage"),
    toStage: text("to_stage").notNull(),
    agentId: uuid("agent_id").references(() => agents.id),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    storyIdx: index("story_stages_story_idx").on(table.storyId),
  }),
);
