
import React, { useState } from 'react';
import TaskList from './components/TaskList';
import { useTaskManager } from './hooks/useTaskManager';
import { Task } from './types';
import { EmptyState } from './EmptyState';
import { TaskHeader } from './components/TaskHeader';
import { Card, CardContent } from '@/components/ui/card';

export interface TaskManagerProps {
  documentId: string;
  initialTasks?: Task[];
  onTaskUpdate?: () => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ 
  documentId, 
  initialTasks = [],
  onTaskUpdate 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTaskManager(documentId);

  // Filter tasks based on the current filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status !== 'completed';
    return task.status === 'completed';
  });

  // Handle task updates
  const handleTaskUpdate = (updatedTask: Task) => {
    updateTask(updatedTask.id, updatedTask);
    if (onTaskUpdate) {
      onTaskUpdate();
    }
  };

  // Handle creating a new task
  const handleCreateTask = () => {
    setShowForm(true);
  };

  // Handle task creation completion
  const handleTaskCreated = () => {
    setShowForm(false);
    if (onTaskUpdate) {
      onTaskUpdate();
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <TaskHeader
            filter={filter}
            onFilterChange={setFilter}
            onCreateTask={handleCreateTask}
          />
          
          {showForm ? (
            <div className="mt-4">
              <p className="text-center text-sm text-muted-foreground">Task form will be implemented here</p>
            </div>
          ) : null}
          
          {loading ? (
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground">Loading tasks...</p>
            </div>
          ) : filteredTasks.length > 0 ? (
            <TaskList
              tasks={filteredTasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={deleteTask}
              isLoading={loading}
            />
          ) : (
            <EmptyState filter={filter} />
          )}
          
          {error && (
            <div className="mt-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
