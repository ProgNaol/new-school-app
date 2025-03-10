import mongoose from 'mongoose';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin'
}

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true
  },
  password: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: Object.values(UserRole),
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const User = mongoose.model('User', userSchema);