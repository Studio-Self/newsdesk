import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { editorialTasks } from "./editorial_tasks.js";
import { agents } from "./agents.js";

export const taskComments = pgTable(
  "task_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id").notNull().references(() => editorialTasks.id),
    agentId: uuid("agent_id").references(() => agents.id),
    authorName: text("author_name"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    taskIdx: index("task_comments_task_idx").on(table.taskId),
  }),
);
