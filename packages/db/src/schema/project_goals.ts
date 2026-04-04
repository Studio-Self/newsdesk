import { pgTable, uuid, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { projects } from "./projects.js";
import { goals } from "./goals.js";

export const projectGoals = pgTable(
  "project_goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id").notNull().references(() => projects.id),
    goalId: uuid("goal_id").notNull().references(() => goals.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    projectGoalIdx: uniqueIndex("project_goals_unique_idx").on(table.projectId, table.goalId),
  }),
);
