import { pgTable, uuid, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { documents } from "./documents.js";

export const documentRevisions = pgTable(
  "document_revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id").notNull().references(() => documents.id),
    revision: integer("revision").notNull(),
    body: text("body").notNull(),
    changedBy: text("changed_by"),
    changeNotes: text("change_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    documentIdx: index("document_revisions_document_idx").on(table.documentId),
    documentRevIdx: index("document_revisions_doc_rev_idx").on(table.documentId, table.revision),
  }),
);
