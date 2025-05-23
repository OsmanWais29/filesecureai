
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, User } from 'lucide-react';
import { Task } from '../../types';

interface TaskManagementProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({ 
  tasks = [], 
  onTaskUpdate 
}) => {
  // Normalize task date field
  const getTaskDueDate = (task: Task): string | undefined => {
    return task.due_date || task.dueDate;
  };

  // Sample tasks if none provided
  const sampleTasks: Task[] = [
    {
      id: '1',
      title: 'Review Financial Documents',
      description: 'Review and verify all submitted financial documents',
      status: 'pending',
      priority: 'high',
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_to: 'trustee-1',
      created_by: 'system'
    },
    {
      id: '2',
      title: 'Schedule Creditor Meeting',
      description: 'Coordinate and schedule the creditor meeting',
      status: 'in-progress',
      priority: 'medium',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_to: 'trustee-1',
      created_by: 'system'
    },
    {
      id: '3',
      title: 'Complete Asset Valuation',
      description: 'Assess and value all client assets',
      status: 'completed',
      priority: 'low',
      due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_to: 'trustee-2',
      created_by: 'system'
    }
  ];

  const displayTasks = tasks.length > 0 ? tasks : sampleTasks;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Task Management ({displayTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayTasks.map((task) => {
            const dueDate = getTaskDueDate(task);
            const isOverdue = dueDate && new Date(dueDate) < new Date();
            
            return (
              <div key={task.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {dueDate && (
                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                      <Clock className="h-3 w-3" />
                      Due: {new Date(dueDate).toLocaleDateString()}
                      {isOverdue && <span className="text-red-600 font-medium">(Overdue)</span>}
                    </div>
                  )}
                  
                  {(task.assigned_to || task.assignedTo) && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Assigned to: {task.assigned_to || task.assignedTo}
                    </div>
                  )}
                </div>

                {onTaskUpdate && task.status !== 'completed' && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onTaskUpdate(task.id, { status: 'in-progress' })}
                      disabled={task.status === 'in-progress'}
                    >
                      Start Task
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onTaskUpdate(task.id, { status: 'completed' })}
                    >
                      Mark Complete
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
