
export interface Task {
  id: string;
  title: string;
  description?: string;
  status?: string;
  assigned_to?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  due_date?: string;
  severity?: string;
  document_id?: string;
  solution?: string;
}

export interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (updatedTask: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  isLoading?: boolean;
}
