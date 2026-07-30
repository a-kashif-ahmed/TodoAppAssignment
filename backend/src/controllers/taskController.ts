import { Response } from 'express';
import Task, { ITask } from '../models/Task';
import { AuthRequest } from '../middleware/auth';
import { smartSortTasks } from '../utils/sortAlgorithm';
import { HydratedDocument } from 'mongoose';


export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, dateTime, deadline, priority, category } = req.body;

    if (!title || !dateTime || !deadline) {
      return res.status(400).json({ message: 'Title, dateTime, and deadline are required' });
    }

    const task = await Task.create({
      user: req.userId,
      title,
      description,
      dateTime,
      deadline,
      priority,
      category,
    });

    return res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ message: 'Server error while creating task' });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { status, category, sort } = req.query;

    const query: Record<string, unknown> = { user: req.userId };
    if (status === 'completed') query.completed = true;
    if (status === 'pending') query.completed = false;
    if (category && category !== 'All') query.category = category;

    let tasks: HydratedDocument<ITask>[] = await Task.find(query);

    switch (sort) {
      case 'deadline':
        tasks = tasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        break;
      case 'priority': {
        const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
        tasks = tasks.sort((a, b) => order[a.priority] - order[b.priority]);
        break;
      }
      case 'dateTime':
        tasks = tasks.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
        break;
      case 'smart':
      default:
        tasks = smartSortTasks(tasks);
        break;
    }

    return res.status(200).json({ count: tasks.length, tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};



export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const allowedFields = ['title', 'description', 'dateTime', 'deadline', 'priority', 'category'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (task as any)[field] = req.body[field];
      }
    });

    await task.save();
    return res.status(200).json({ message: 'Task updated', task });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ message: 'Server error while updating task' });
  }
};



export const toggleTaskCompletion = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.completed = !task.completed;
    await task.save();

    return res.status(200).json({ message: 'Task status updated', task });
  } catch (error) {
    console.error('Toggle task error:', error);
    return res.status(500).json({ message: 'Server error while updating task status' });
  }
};


export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ message: 'Server error while deleting task' });
  }
};
