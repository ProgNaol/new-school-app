import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  dueDate: { type: Date, required: true },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const Assignment = mongoose.model('Assignment', assignmentSchema);
