export type Priority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  user: string;
  title: string;
  description: string;
  dateTime: string; // ISO string
  deadline: string; // ISO string
  priority: Priority;
  category: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  TaskList: undefined;
  AddTask: undefined;
  EditTask: { task: Task };
};
