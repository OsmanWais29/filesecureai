
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '../types';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate?: (task: Task) => void;
  isLoading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskUpdate, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary" />
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No tasks found
      </div>
    );
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <Card key={task.id} className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {getStatusIcon(task.status)}
                  <h4 className="font-medium">{task.title}</h4>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                )}
              </div>
              <Badge className={getSeverityColor(task.severity)}>
                {task.severity || 'Unknown'}
              </Badge>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {task.created_at && (
                <span>Created {formatDistanceToNow(new Date(task.created_at))} ago</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TaskList;
