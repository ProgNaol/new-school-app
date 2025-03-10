import mongoose from 'mongoose';
import { UserRole } from './User';

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  targetRole: { 
    type: String, 
    enum: Object.values(UserRole),
    required: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const Announcement = mongoose.model('Announcement', announcementSchema);
