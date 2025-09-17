import { User } from 'firebase/auth';

// Firebase User type (re-export for convenience)
export type FirebaseUser = User;

// Task interface for Firestore
export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
  position: number;
  totalTimeSpent: number; // in seconds
  color?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Time log interface for Firestore
export interface TimeLog {
  id: string;
  userId: string;
  taskId?: string;
  duration: number; // in seconds
  sessionType: 'work' | 'break';
  createdAt: Date;
}

// Database collections
export const COLLECTIONS = {
  TASKS: 'tasks',
  TIME_LOGS: 'timeLogs',
  USERS: 'users'
} as const;

