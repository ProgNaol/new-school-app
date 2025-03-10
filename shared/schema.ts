import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the user roles as a tuple of string literals for proper type safety
const userRoles = ["student", "teacher", "admin"] as const;
export const UserRole = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
} as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: userRoles }).notNull(),
  name: text("name").notNull(),
});

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  teacherId: integer("teacher_id").notNull(),
  fileUrl: text("file_url").notNull().default(""),
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  teacherId: integer("teacher_id").notNull(),
  questions: text("questions").array().notNull(),
  answers: text("answers").array().notNull(),
  timeLimit: integer("time_limit"), // in minutes
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const studentQuizzes = pgTable("student_quizzes", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  quizId: integer("quiz_id").notNull(),
  answers: text("answers").array(),
  score: integer("score"),
  completedAt: timestamp("completed_at"),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  adminId: integer("admin_id").notNull(),
  targetRole: text("target_role", { enum: userRoles }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const studentGrades = pgTable("student_grades", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  assignmentId: integer("assignment_id").notNull(),
  grade: integer("grade").notNull(),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertAssignmentSchema = createInsertSchema(assignments);
export const insertQuizSchema = createInsertSchema(quizzes);
export const insertStudentQuizSchema = createInsertSchema(studentQuizzes);
export const insertAnnouncementSchema = createInsertSchema(announcements);
export const insertGradeSchema = createInsertSchema(studentGrades);

// Create types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Assignment = typeof assignments.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type StudentQuiz = typeof studentQuizzes.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type StudentGrade = typeof studentGrades.$inferSelect;