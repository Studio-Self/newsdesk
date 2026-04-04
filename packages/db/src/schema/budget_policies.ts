import { pgTable, uuid, text, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";
import { newsrooms } from "./newsrooms.js";

export const budgetPolicies = pgTable(
  "budget_policies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsroomId: uuid("newsroom_id").notNull().references(() => newsrooms.id),
    name: text("name").notNull(),
    scope: text("scope").notNull().default("newsroom"),
    scopeId: uuid("scope_id"),
    limitCents: integer("limit_cents").notNull(),
    periodDays: integer("period_days").notNull().default(30),
    alertThresholdPct: integer("alert_threshold_pct").notNull().default(80),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    newsroomIdx: index("budget_policies_newsroom_idx").on(table.newsroomId),
  }),
);
