import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { stories } from "./stories.js";
import { agents } from "./agents.js";

export const sources = pgTable(
  "sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storyId: uuid("story_id").notNull().references(() => stories.id),
    url: text("url").notNull(),
    title: text("title"),
    excerpt: text("excerpt"),
    verified: boolean("verified").notNull().default(false),
    verifiedByAgentId: uuid("verified_by_agent_id").references(() => agents.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    storyIdx: index("sources_story_idx").on(table.storyId),
  }),
);
