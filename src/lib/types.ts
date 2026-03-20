export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export type TaskPriority = 'low' | 'normal' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  user_id: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  task_id: string;
  user_id?: string;
  content: string;
  type: 'status_change' | 'edit' | 'creation';
  created_at: string;
}
