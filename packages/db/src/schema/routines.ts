import { pgTable, uuid, text, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { newsrooms } from "./newsrooms.js";
import { agents } from "./agents.js";

export const routines = pgTable(
  "routines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsroomId: uuid("newsroom_id").notNull().references(() => newsrooms.id),
    name: text("name").notNull(),
    description: text("description"),
    schedule: text("schedule").notNull(),
    agentId: uuid("agent_id").references(() => agents.id),
    action: text("action").notNull(),
    actionConfig: jsonb("action_config").$type<Record<string, unknown>>().notNull().default({}),
    enabled: boolean("enabled").notNull().default(true),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    nextRunAt: timestamp("next_run_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    newsroomIdx: index("routines_newsroom_idx").on(table.newsroomId),
    enabledIdx: index("routines_enabled_idx").on(table.enabled),
  }),
);
