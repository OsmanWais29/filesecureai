
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EnhancedTask } from '@/hooks/useEnhancedTaskManagement';
import { TaskCardHeader } from './TaskCardHeader';
import { TaskCardContent } from './TaskCardContent';
import { TaskCardActions } from './TaskCardActions';
import { TaskCardFooter } from './TaskCardFooter';

interface TaskCardProps {
  task: EnhancedTask;
  onUpdate: (taskId: string, updates: Partial<EnhancedTask>) => void;
  onDelete: (taskId: string) => void;
  onAssign: (taskId: string, assigneeId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onUpdate,
  onDelete,
  onAssign
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  const handleStatusChange = (newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    onUpdate(task.id, { status: newStatus });
  };

  const handleEdit = () => {
    setIsExpanded(true);
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isOverdue ? 'border-red-300' : ''}`}>
      <CardHeader className="pb-3">
        <TaskCardHeader
          task={task}
          onDelete={onDelete}
          onEdit={handleEdit}
        />
      </CardHeader>
      
      <CardContent className="space-y-4">
        <TaskCardContent task={task} />
        <TaskCardActions task={task} onStatusChange={handleStatusChange} />
        <TaskCardFooter task={task} />
      </CardContent>
    </Card>
  );
};
