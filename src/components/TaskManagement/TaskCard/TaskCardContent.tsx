
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle,
  Calendar,
  User,
  Clock,
  BookOpen
} from 'lucide-react';
import { EnhancedTask } from '@/hooks/useEnhancedTaskManagement';

interface TaskCardContentProps {
  task: EnhancedTask;
}

export const TaskCardContent: React.FC<TaskCardContentProps> = ({ task }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <div className="space-y-4">
      {task.description && (
        <p className="text-sm text-muted-foreground line-clamp-3">
          {task.description}
        </p>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{task.completion_percentage}%</span>
        </div>
        <Progress value={task.completion_percentage} className="h-2" />
      </div>

      {/* Task Details */}
      <div className="space-y-2 text-sm">
        {task.form_number && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Form:</span>
            <Badge variant="outline">{task.form_number}</Badge>
          </div>
        )}
        
        {task.severity && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className={`font-medium ${getSeverityColor(task.severity)}`}>
              {task.severity.toUpperCase()} SEVERITY
            </span>
          </div>
        )}
        
        {task.due_date && (
          <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600' : ''}`}>
            <Calendar className="h-4 w-4" />
            <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
            {isOverdue && <span className="font-medium">(Overdue)</span>}
          </div>
        )}
        
        {task.assigned_to && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Assigned to: {task.assigned_to}</span>
          </div>
        )}
        
        {task.estimated_duration && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Est. {task.estimated_duration} min</span>
          </div>
        )}
      </div>

      {/* BIA Compliance Info */}
      {(task.bia_section || task.regulation) && (
        <div className="p-2 bg-blue-50 rounded-lg">
          <div className="text-xs font-medium text-blue-900 mb-1">BIA Compliance</div>
          {task.bia_section && (
            <div className="text-xs text-blue-700">Section: {task.bia_section}</div>
          )}
          {task.regulation && (
            <div className="text-xs text-blue-700">Regulation: {task.regulation}</div>
          )}
        </div>
      )}

      {/* Solution Preview */}
      {task.solution && (
        <div className="p-2 bg-green-50 rounded-lg">
          <div className="text-xs font-medium text-green-900 mb-1">Recommended Solution</div>
          <div className="text-xs text-green-700 line-clamp-2">{task.solution}</div>
        </div>
      )}
    </div>
  );
};
