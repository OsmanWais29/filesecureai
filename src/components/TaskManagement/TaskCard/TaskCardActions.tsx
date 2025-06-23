
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { EnhancedTask } from '@/hooks/useEnhancedTaskManagement';

interface TaskCardActionsProps {
  task: EnhancedTask;
  onStatusChange: (newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled') => void;
}

export const TaskCardActions: React.FC<TaskCardActionsProps> = ({
  task,
  onStatusChange
}) => {
  return (
    <div className="flex gap-2 pt-2">
      {task.status === 'pending' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onStatusChange('in_progress')}
          className="flex-1"
        >
          Start Task
        </Button>
      )}
      
      {task.status === 'in_progress' && (
        <Button
          size="sm"
          onClick={() => onStatusChange('completed')}
          className="flex-1"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete
        </Button>
      )}
      
      {task.status === 'completed' && (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          Completed
        </div>
      )}
    </div>
  );
};
