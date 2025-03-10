import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from 'ws';
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { UserRole } from "@shared/schema";

// Helper function to check authentication and authorization
function ensureAuthenticated(req: Request, roles: string[]) {
  if (!req.isAuthenticated()) {
    throw new Error("Unauthorized");
  }

  // Use a type guard to ensure req.user exists and has the role property
  const user = req.user as Express.User;
  if (!user || !roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
}

// Helper function to safely get the authenticated user 
function getAuthUser(req: Request): Express.User {
  if (!req.isAuthenticated() || !req.user) {
    throw new Error("Unauthorized");
  }
  return req.user as Express.User;
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Get all users (admin only)
  app.get("/api/users", async (req, res) => {
    try {
      ensureAuthenticated(req, [UserRole.ADMIN]);
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  // Get all students (for teachers and admin)
  app.get("/api/users/students", async (req, res) => {
    try {
      ensureAuthenticated(req, [UserRole.TEACHER, UserRole.ADMIN]);
      const users = await storage.getUsers();
      const students = users.filter(user => user.role === UserRole.STUDENT);
      res.json(students);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Assignment routes
  app.post("/api/assignments", async (req, res) => {
    try {
      ensureAuthenticated(req, [UserRole.TEACHER]);
      const user = getAuthUser(req);
      
      // Make sure the date is properly formatted and fields match the schema
      const assignment = {
        title: req.body.title,
        description: req.body.description,
        teacherId: user.id,
        fileUrl: req.body.fileUrl || "",
        dueDate: new Date(req.body.dueDate)
      };
      
      console.log("Sending assignment data to storage:", assignment);
      const created = await storage.createAssignment(assignment);
      res.status(201).json(created);
    } catch (error) {
      console.error("Assignment creation error:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get("/api/assignments", async (req, res) => {
    try {
      ensureAuthenticated(req, Object.values(UserRole));
      const user = getAuthUser(req);
      
      if (user.role === UserRole.TEACHER) {
        const assignments = await storage.getAssignmentsByTeacher(user.id);
        res.json(assignments);
      } else {
        const assignments = await storage.getAssignments();
        res.json(assignments);
      }
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Quiz routes
  app.post("/api/quizzes", async (req, res) => {
    try {
      ensureAuthenticated(req, [UserRole.TEACHER]);
      const user = getAuthUser(req);
      
      const quiz = {
        ...req.body,
        teacherId: user.id,
      };
      const created = await storage.createQuiz(quiz);
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get("/api/quizzes", async (req, res) => {
    try {
      ensureAuthenticated(req, Object.values(UserRole));
      const user = getAuthUser(req);
      
      if (user.role === UserRole.TEACHER) {
        const quizzes = await storage.getQuizzesByTeacher(user.id);
        res.json(quizzes);
      } else {
        const quizzes = await storage.getQuizzes();
        res.json(quizzes);
      }
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post("/api/quizzes/:quizId/submit", async (req, res) => {
    try {
      ensureAuthenticated(req, [UserRole.STUDENT]);
      const user = getAuthUser(req);
      
      const studentQuiz = {
        ...req.body,
        studentId: user.id,
        quizId: parseInt(req.params.quizId),
      };
      const submitted = await storage.submitQuiz(studentQuiz);
      res.status(201).json(submitted);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get("/api/student/quizzes", async (req, res) => {
    try {
      ensureAuthenticated(req, [UserRole.STUDENT]);
      const user = getAuthUser(req);
      const quizzes = await storage.getStudentQuizzes(user.id);
      res.json(quizzes);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Grade routes
  app.post("/api/grades", async (req, res) => {
    try {
      ensureAuthenticated(req, [UserRole.TEACHER]);
      const grade = await storage.submitGrade(req.body);
      res.status(201).json(grade);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get("/api/student/grades", async (req, res) => {
    try {
      ensureAuthenticated(req, [UserRole.STUDENT]);
      const user = getAuthUser(req);
      const grades = await storage.getStudentGrades(user.id);
      res.json(grades);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Announcements routes
  app.post("/api/announcements", async (req, res) => {
    try {
      ensureAuthenticated(req, [UserRole.ADMIN]);
      const user = getAuthUser(req);
      
      // Properly format the announcement object to match schema
      const announcement = {
        title: req.body.title,
        content: req.body.content,
        adminId: user.id,
        targetRole: req.body.targetRole || null
      };
      
      console.log("Sending announcement data to storage:", announcement);
      const created = await storage.createAnnouncement(announcement);
      res.status(201).json(created);
    } catch (error) {
      console.error("Announcement creation error:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get("/api/announcements", async (req, res) => {
    try {
      ensureAuthenticated(req, Object.values(UserRole));
      const user = getAuthUser(req);
      const announcements = await storage.getAnnouncements(user.role);
      res.json(announcements);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);

  // Set up WebSocket server for live chat
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      // Broadcast message to all connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      });
    });
  });

  return httpServer;
}