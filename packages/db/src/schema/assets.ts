import { pgTable, uuid, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { newsrooms } from "./newsrooms.js";
import { stories } from "./stories.js";

export const assets = pgTable(
  "assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    newsroomId: uuid("newsroom_id").notNull().references(() => newsrooms.id),
    storyId: uuid("story_id").references(() => stories.id),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    storagePath: text("storage_path").notNull(),
    altText: text("alt_text"),
    caption: text("caption"),
    uploadedBy: text("uploaded_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    newsroomIdx: index("assets_newsroom_idx").on(table.newsroomId),
    storyIdx: index("assets_story_idx").on(table.storyId),
  }),
);
