import { pgTable, uuid, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { newsrooms } from "./newsrooms.js";

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsroomId: uuid("newsroom_id").notNull().references(() => newsrooms.id),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    body: text("body").notNull().default(""),
    category: text("category").notNull().default("general"),
    currentRevision: integer("current_revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    newsroomIdx: index("documents_newsroom_idx").on(table.newsroomId),
    newsroomCategoryIdx: index("documents_newsroom_category_idx").on(table.newsroomId, table.category),
    slugIdx: index("documents_slug_idx").on(table.newsroomId, table.slug),
  }),
);
