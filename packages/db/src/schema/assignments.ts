import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { newsrooms } from "./newsrooms.js";
import { beats } from "./beats.js";
import { agents } from "./agents.js";

export const assignments = pgTable(
  "assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsroomId: uuid("newsroom_id").notNull().references(() => newsrooms.id),
    beatId: uuid("beat_id").references(() => beats.id),
    title: text("title").notNull(),
    description: text("description"),
    assignedByAgentId: uuid("assigned_by_agent_id").references(() => agents.id),
    status: text("status").notNull().default("open"),
    priority: text("priority").notNull().default("normal"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    newsroomStatusIdx: index("assignments_newsroom_status_idx").on(table.newsroomId, table.status),
  }),
);
