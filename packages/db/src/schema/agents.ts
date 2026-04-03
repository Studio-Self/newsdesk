import { pgTable, uuid, text, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { newsrooms } from "./newsrooms.js";

export const agents = pgTable(
  "agents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsroomId: uuid("newsroom_id").notNull().references(() => newsrooms.id),
    name: text("name").notNull(),
    role: text("role").notNull().default("reporter"),
    title: text("title"),
    icon: text("icon"),
    status: text("status").notNull().default("idle"),
    adapterType: text("adapter_type").notNull().default("claude-local"),
    adapterConfig: jsonb("adapter_config").$type<Record<string, unknown>>().notNull().default({}),
    budgetMonthlyCents: integer("budget_monthly_cents").notNull().default(0),
    spentMonthlyCents: integer("spent_monthly_cents").notNull().default(0),
    lastHeartbeatAt: timestamp("last_heartbeat_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    newsroomStatusIdx: index("agents_newsroom_status_idx").on(table.newsroomId, table.status),
    newsroomRoleIdx: index("agents_newsroom_role_idx").on(table.newsroomId, table.role),
  }),
);
