import { Task, Priority } from '../types';

const PRIORITY_WEIGHT: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
const WEIGHTS = { deadline: 0.5, priority: 0.35, dateTime: 0.15 };

/**
 * Client-side mirror of the backend's smart-sort algorithm. Blends deadline
 * urgency, manual priority, and scheduled date-time into a single score so
 * the most pressing tasks rise to the top. Completed tasks always sink
 * to the bottom of the list.
 */
export const smartSortTasks = (tasks: Task[]): Task[] => {
  const now = Date.now();
  const deadlineTimes = tasks.map((t) => new Date(t.deadline).getTime());
  const dateTimeTimes = tasks.map((t) => new Date(t.dateTime).getTime());

  const maxDeadlineSpan = Math.max(...deadlineTimes.map((d) => Math.abs(d - now)), 1);
  const maxDateTimeSpan = Math.max(...dateTimeTimes.map((d) => Math.abs(d - now)), 1);

  const scored = tasks.map((task) => {
    const deadlineMs = new Date(task.deadline).getTime();
    const dateTimeMs = new Date(task.dateTime).getTime();

    const deadlineUrgency = 1 - Math.min(Math.abs(deadlineMs - now) / maxDeadlineSpan, 1);
    const priorityScore = PRIORITY_WEIGHT[task.priority] / 3;
    const dateTimeScore = 1 - Math.min(Math.abs(dateTimeMs - now) / maxDateTimeSpan, 1);

    const score =
      deadlineUrgency * WEIGHTS.deadline +
      priorityScore * WEIGHTS.priority +
      dateTimeScore * WEIGHTS.dateTime;

    return { task, score };
  });

  scored.sort((a, b) => {
    if (a.task.completed !== b.task.completed) return a.task.completed ? 1 : -1;
    return b.score - a.score;
  });

  return scored.map((s) => s.task);
};

export const filterByCategory = (tasks: Task[], category: string): Task[] =>
  category === 'All' ? tasks : tasks.filter((t) => t.category === category);

export const getUniqueCategories = (tasks: Task[]): string[] => {
  const set = new Set(tasks.map((t) => t.category || 'General'));
  return ['All', ...Array.from(set)];
};
