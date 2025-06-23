
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  User, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Brain,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';
import { EnhancedTask } from '@/hooks/useEnhancedTaskManagement';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  const handleStatusChange = (newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    onUpdate(task.id, { status: newStatus });
  };

  const handleProgressUpdate = (progress: number) => {
    onUpdate(task.id, { completion_percentage: progress });
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isOverdue ? 'border-red-300' : ''}`}>
      <CardHeader className="pb-3">
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
              <DropdownMenuItem onClick={() => setIsExpanded(true)}>
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
      </CardHeader>
      
      <CardContent className="space-y-4">
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

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {task.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('in_progress')}
              className="flex-1"
            >
              Start Task
            </Button>
          )}
          
          {task.status === 'in_progress' && (
            <Button
              size="sm"
              onClick={() => handleStatusChange('completed')}
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

        {/* AI Confidence Score */}
        {task.ai_confidence_score && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Brain className="h-3 w-3" />
            <span>AI Confidence: {Math.round(task.ai_confidence_score * 100)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
