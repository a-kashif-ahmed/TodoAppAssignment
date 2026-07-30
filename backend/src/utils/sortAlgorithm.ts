import { ITask } from "../models/Task";

const priorityOrder: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export const smartSortTasks = <T extends ITask>(tasks: T[]): T[] => {
  return [...tasks].sort((a, b) => {
    // pending task
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // nearest deadline
    const deadlineDiff =
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime();

    if (deadlineDiff !== 0) {
      return deadlineDiff;
    }

    // High preference 
    const priorityDiff =
      priorityOrder[b.priority] - priorityOrder[a.priority];

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    // scheduled ones first
    return (
      new Date(a.dateTime).getTime() -
      new Date(b.dateTime).getTime()
    );
  });
};