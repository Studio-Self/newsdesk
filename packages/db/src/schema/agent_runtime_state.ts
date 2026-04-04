import { pgTable, uuid, jsonb, timestamp } from "drizzle-orm/pg-core";
import { agents } from "./agents.js";

export const agentRuntimeState = pgTable("agent_runtime_state", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().unique().references(() => agents.id),
  state: jsonb("state").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
