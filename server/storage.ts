import { users, assignments, announcements, quizzes, studentQuizzes, studentGrades } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: any): Promise<any>;
  getUsers(): Promise<any[]>;

  // Assignment operations
  createAssignment(assignment: any): Promise<any>;
  getAssignments(): Promise<any[]>;
  getAssignmentsByTeacher(teacherId: number): Promise<any[]>;

  // Quiz operations
  createQuiz(quiz: any): Promise<any>;
  getQuizzes(): Promise<any[]>;
  getQuizzesByTeacher(teacherId: number): Promise<any[]>;
  submitQuiz(studentQuiz: any): Promise<any>;
  getStudentQuizzes(studentId: number): Promise<any[]>;

  // Grade operations
  submitGrade(grade: any): Promise<any>;
  getStudentGrades(studentId: number): Promise<any[]>;

  // Announcement operations
  createAnnouncement(announcement: any): Promise<any>;
  getAnnouncements(role?: string): Promise<any[]>;

  sessionStore: session.Store;
}

export class PostgresStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error in getUser:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async getUserByUsername(username: string) {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      throw new Error('Failed to fetch user by username');
    }
  }

  async getUsers() {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async createUser(userData: any) {
    try {
      const [user] = await db.insert(users).values(userData).returning();
      return user;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw new Error('Failed to create user');
    }
  }

  async createAssignment(assignmentData: any) {
    try {
      // Log the incoming data to debug
      console.log("Creating assignment with data:", assignmentData);
      
      // Ensure the data matches your schema
      const sanitizedData = {
        title: assignmentData.title,
        description: assignmentData.description,
        teacherId: assignmentData.teacherId,
        fileUrl: assignmentData.fileUrl || "",
        dueDate: assignmentData.dueDate instanceof Date 
          ? assignmentData.dueDate 
          : new Date(assignmentData.dueDate)
      };
      
      console.log("Sanitized assignment data:", sanitizedData);
      const [assignment] = await db.insert(assignments).values(sanitizedData).returning();
      return assignment;
    } catch (error) {
      console.error('Error in createAssignment:', error);
      console.error('Assignment data:', assignmentData);
      throw new Error(`Failed to create assignment: ${(error as Error).message}`);
    }
  }

  async getAssignments() {
    try {
      return await db.select().from(assignments);
    } catch (error) {
      console.error('Error in getAssignments:', error);
      throw new Error('Failed to fetch assignments');
    }
  }

  async getAssignmentsByTeacher(teacherId: number) {
    try {
      return await db
        .select()
        .from(assignments)
        .where(eq(assignments.teacherId, teacherId));
    } catch (error) {
      console.error('Error in getAssignmentsByTeacher:', error);
      throw new Error('Failed to fetch teacher assignments');
    }
  }

  async createQuiz(quizData: any) {
    try {
      const [quiz] = await db.insert(quizzes).values(quizData).returning();
      return quiz;
    } catch (error) {
      console.error('Error in createQuiz:', error);
      throw new Error('Failed to create quiz');
    }
  }

  async getQuizzes() {
    try {
      return await db.select().from(quizzes);
    } catch (error) {
      console.error('Error in getQuizzes:', error);
      throw new Error('Failed to fetch quizzes');
    }
  }

  async getQuizzesByTeacher(teacherId: number) {
    try {
      return await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.teacherId, teacherId));
    } catch (error) {
      console.error('Error in getQuizzesByTeacher:', error);
      throw new Error('Failed to fetch teacher quizzes');
    }
  }

  async submitQuiz(studentQuizData: any) {
    try {
      const [studentQuiz] = await db.insert(studentQuizzes).values(studentQuizData).returning();
      return studentQuiz;
    } catch (error) {
      console.error('Error in submitQuiz:', error);
      throw new Error('Failed to submit quiz');
    }
  }

  async getStudentQuizzes(studentId: number) {
    try {
      return await db
        .select()
        .from(studentQuizzes)
        .where(eq(studentQuizzes.studentId, studentId));
    } catch (error) {
      console.error('Error in getStudentQuizzes:', error);
      throw new Error('Failed to fetch student quizzes');
    }
  }

  async submitGrade(gradeData: any) {
    try {
      const [grade] = await db.insert(studentGrades).values(gradeData).returning();
      return grade;
    } catch (error) {
      console.error('Error in submitGrade:', error);
      throw new Error('Failed to submit grade');
    }
  }

  async getStudentGrades(studentId: number) {
    try {
      return await db
        .select()
        .from(studentGrades)
        .where(eq(studentGrades.studentId, studentId));
    } catch (error) {
      console.error('Error in getStudentGrades:', error);
      throw new Error('Failed to fetch student grades');
    }
  }

  async createAnnouncement(announcementData: any) {
    try {
      // Log the incoming data to debug
      console.log("Creating announcement with data:", announcementData);
      
      // Ensure the data matches your schema
      const sanitizedData = {
        title: announcementData.title,
        content: announcementData.content,
        adminId: announcementData.adminId,
        targetRole: announcementData.targetRole || null
      };
      
      console.log("Sanitized announcement data:", sanitizedData);
      const [announcement] = await db.insert(announcements).values(sanitizedData).returning();
      return announcement;
    } catch (error) {
      console.error('Error in createAnnouncement:', error);
      console.error('Announcement data:', announcementData);
      throw new Error(`Failed to create announcement: ${(error as Error).message}`);
    }
  }

  async getAnnouncements(role?: string) {
    try {
      // If role is provided, we could filter announcements targeted for that role
      // For now, return all announcements as per your original implementation
      return await db.select().from(announcements);
    } catch (error) {
      console.error('Error in getAnnouncements:', error);
      throw new Error('Failed to fetch announcements');
    }
  }
}

export const storage = new PostgresStorage();