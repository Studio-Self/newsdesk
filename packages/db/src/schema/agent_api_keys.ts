import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { agents } from "./agents.js";
import { newsrooms } from "./newsrooms.js";

export const agentApiKeys = pgTable(
  "agent_api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id").notNull().references(() => agents.id),
    newsroomId: uuid("newsroom_id").notNull().references(() => newsrooms.id),
    keyHash: text("key_hash").notNull(),
    label: text("label").notNull().default("default"),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    agentIdx: index("agent_api_keys_agent_idx").on(table.agentId),
    newsroomIdx: index("agent_api_keys_newsroom_idx").on(table.newsroomId),
  }),
);
