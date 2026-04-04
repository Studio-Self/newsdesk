import { pgTable, uuid, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { projects } from "./projects.js";
import { stories } from "./stories.js";

export const projectStories = pgTable(
  "project_stories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id").notNull().references(() => projects.id),
    storyId: uuid("story_id").notNull().references(() => stories.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    projectStoryIdx: uniqueIndex("project_stories_unique_idx").on(table.projectId, table.storyId),
  }),
);
