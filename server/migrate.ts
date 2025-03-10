import { db } from './db';
import { users, assignments, announcements, quizzes, studentQuizzes, studentGrades } from '@shared/schema';
import { eq } from 'drizzle-orm';
import * as schema from '@shared/schema';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { UserRole } from '@shared/schema';
import { hash } from 'bcrypt';

const SALT_ROUNDS = 10;

async function migrate() {
  console.log('Starting database migration...');
  
  try {
    // Create tables
    console.log('Creating tables...');
    
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL
      );
    `);
    
    // Create assignments table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        teacher_id INTEGER NOT NULL,
        file_url TEXT NOT NULL DEFAULT '',
        due_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create quizzes table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        teacher_id INTEGER NOT NULL,
        questions TEXT[] NOT NULL,
        answers TEXT[] NOT NULL,
        time_limit INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create student_quizzes table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS student_quizzes (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        quiz_id INTEGER NOT NULL,
        answers TEXT[],
        score INTEGER,
        completed_at TIMESTAMP
      );
    `);
    
    // Create announcements table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        admin_id INTEGER NOT NULL,
        target_role TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create student_grades table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS student_grades (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        assignment_id INTEGER NOT NULL,
        grade INTEGER NOT NULL,
        feedback TEXT,
        submitted_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Tables created successfully!');
    
    // Check if we need to add seed data (if users table is empty)
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length === 0) {
      console.log('Adding seed data...');
      
      // Add admin user
      const adminPassword = await hash('admin123', SALT_ROUNDS);
      await db.insert(users).values({
        username: 'admin',
        password: adminPassword,
        role: UserRole.ADMIN,
        name: 'System Admin'
      });
      
      // Add a teacher
      const teacherPassword = await hash('teacher123', SALT_ROUNDS);
      await db.insert(users).values({
        username: 'teacher',
        password: teacherPassword,
        role: UserRole.TEACHER,
        name: 'John Teacher'
      });
      
      // Add a few students with unique IDs
      const studentPassword = await hash('student123', SALT_ROUNDS);
      for (let i = 1; i <= 5; i++) {
        const studentId = `STU${String(i).padStart(4, '0')}`;
        await db.insert(users).values({
          username: `student${i}`,
          password: studentPassword,
          role: UserRole.STUDENT,
          name: `Student ${i}`
        });
      }
      
      console.log('Seed data added successfully!');
    } else {
      console.log('Database already has users, skipping seed data.');
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the connection
    process.exit(0);
  }
}

migrate();
