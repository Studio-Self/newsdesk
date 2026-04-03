import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { newsrooms } from "./newsrooms.js";
import { agents } from "./agents.js";
import { stories } from "./stories.js";
import { agentRuns } from "./agent_runs.js";

export const costEvents = pgTable(
  "cost_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsroomId: uuid("newsroom_id").notNull().references(() => newsrooms.id),
    agentId: uuid("agent_id").notNull().references(() => agents.id),
    storyId: uuid("story_id").references(() => stories.id),
    runId: uuid("run_id").references(() => agentRuns.id),
    amountCents: integer("amount_cents").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    newsroomIdx: index("cost_events_newsroom_idx").on(table.newsroomId),
    agentIdx: index("cost_events_agent_idx").on(table.agentId),
    storyIdx: index("cost_events_story_idx").on(table.storyId),
  }),
);
