export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
  position: number;
  total_time_spent: number; // in seconds
  color?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TimeLog {
  id: string;
  user_id: string;
  task_id: string;
  duration: number; // in seconds
  session_type: 'work' | 'break';
  created_at: string;
}

export type TaskStatus = 'todo' | 'doing' | 'done';