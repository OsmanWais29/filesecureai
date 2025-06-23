
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardTitle } from '@/components/ui/card';
import { 
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Brain
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EnhancedTask } from '@/hooks/useEnhancedTaskManagement';

interface TaskCardHeaderProps {
  task: EnhancedTask;
  onDelete: (taskId: string) => void;
  onEdit: () => void;
}

export const TaskCardHeader: React.FC<TaskCardHeaderProps> = ({
  task,
  onDelete,
  onEdit
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <CardTitle className="text-base font-medium line-clamp-2">
          {task.title}
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
          <Badge variant={getStatusColor(task.status)}>
            {task.status.replace('_', ' ')}
          </Badge>
          {task.ai_generated && (
            <Badge variant="outline" className="gap-1">
              <Brain className="h-3 w-3" />
              AI
            </Badge>
          )}
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onDelete(task.id)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
