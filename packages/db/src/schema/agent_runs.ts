import { pgTable, uuid, text, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { agents } from "./agents.js";
import { stories } from "./stories.js";

export const agentRuns = pgTable(
  "agent_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id").notNull().references(() => agents.id),
    storyId: uuid("story_id").references(() => stories.id),
    status: text("status").notNull().default("running"),
    stage: text("stage"),
    inputSummary: text("input_summary"),
    outputSummary: text("output_summary"),
    tokenUsage: jsonb("token_usage").$type<{
      inputTokens: number;
      outputTokens: number;
      model: string;
    }>(),
    costCents: integer("cost_cents").notNull().default(0),
    durationMs: integer("duration_ms"),
    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => ({
    agentIdx: index("agent_runs_agent_idx").on(table.agentId),
    storyIdx: index("agent_runs_story_idx").on(table.storyId),
    statusIdx: index("agent_runs_status_idx").on(table.status),
  }),
);
