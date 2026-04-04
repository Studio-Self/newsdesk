import { pgTable, uuid, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { newsrooms } from "./newsrooms.js";
import { agents } from "./agents.js";
import { budgetPolicies } from "./budget_policies.js";

export const budgetIncidents = pgTable(
  "budget_incidents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsroomId: uuid("newsroom_id").notNull().references(() => newsrooms.id),
    policyId: uuid("policy_id").references(() => budgetPolicies.id),
    agentId: uuid("agent_id").references(() => agents.id),
    type: text("type").notNull(),
    amountCents: integer("amount_cents").notNull(),
    message: text("message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    newsroomIdx: index("budget_incidents_newsroom_idx").on(table.newsroomId),
    policyIdx: index("budget_incidents_policy_idx").on(table.policyId),
  }),
);
