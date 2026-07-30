import { Schema, model, Document, Types } from 'mongoose';

export type Priority = 'low' | 'medium' | 'high';

export interface ITask extends Document {
  user: Types.ObjectId;
  title: string;
  description: string;
  dateTime: Date; 
  deadline: Date; 
  priority: Priority;
  category?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    dateTime: {
      type: Date,
      required: [true, 'Task date-time is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Task deadline is required'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default model<ITask>('Task', TaskSchema);
