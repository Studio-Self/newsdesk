import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { stories } from "./stories.js";
import { agents } from "./agents.js";

export const approvals = pgTable(
  "approvals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storyId: uuid("story_id").notNull().references(() => stories.id),
    stage: text("stage").notNull(),
    status: text("status").notNull().default("pending"),
    requestedByAgentId: uuid("requested_by_agent_id").references(() => agents.id),
    decidedBy: text("decided_by"),
    decisionNotes: text("decision_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
  },
  (table) => ({
    storyIdx: index("approvals_story_idx").on(table.storyId),
    statusIdx: index("approvals_status_idx").on(table.status),
  }),
);
