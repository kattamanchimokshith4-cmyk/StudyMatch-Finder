import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp, date, uniqueIndex } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const usersTable = pgTable("studymatch_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp"),
  course: text("course").notNull(),
  year: integer("year").notNull(),
  subjects: text("subjects").array().notNull().default([]),
  availability: text("availability").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const studyRequestsTable = pgTable("studymatch_requests", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull().references(() => usersTable.id),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  preferredDate: date("preferred_date", { mode: "string" }).notNull(),
  preferredTime: text("preferred_time").notNull(),
  location: text("location").notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const studyRequestMembersTable = pgTable(
  "studymatch_request_members",
  {
    id: serial("id").primaryKey(),
    requestId: integer("request_id").notNull().references(() => studyRequestsTable.id),
    userId: integer("user_id").notNull().references(() => usersTable.id),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    requestUserUnique: uniqueIndex("studymatch_request_user_unique").on(table.requestId, table.userId),
  }),
);

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertStudyRequestSchema = createInsertSchema(studyRequestsTable).omit({ id: true, createdAt: true });
export const insertStudyRequestMemberSchema = createInsertSchema(studyRequestMembersTable).omit({ id: true, joinedAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
export type InsertStudyRequest = z.infer<typeof insertStudyRequestSchema>;
export type StudyRequest = typeof studyRequestsTable.$inferSelect;
export type InsertStudyRequestMember = z.infer<typeof insertStudyRequestMemberSchema>;
export type StudyRequestMember = typeof studyRequestMembersTable.$inferSelect;