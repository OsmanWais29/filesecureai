
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, AlertTriangle, Clock } from 'lucide-react';

interface UpcomingTasksCardProps {
  clientId: string;
}

export const UpcomingTasksCard = ({ clientId }: UpcomingTasksCardProps) => {
  // Mock tasks - in real app this would be fetched based on clientId
  const tasks = [
    {
      id: '1',
      title: 'Review Financial Statements',
      description: 'Analyze monthly income and expenses',
      dueDate: '2024-06-28',
      priority: 'high',
      status: 'pending',
      assignee: 'Jane Doe'
    },
    {
      id: '2',
      title: 'Follow-up Documentation',
      description: 'Request missing bank statements',
      dueDate: '2024-06-30',
      priority: 'medium',
      status: 'in-progress',
      assignee: 'John Smith'
    },
    {
      id: '3',
      title: 'Schedule Court Filing',
      description: 'Prepare and submit proposal documents',
      dueDate: '2024-07-05',
      priority: 'high',
      status: 'pending',
      assignee: 'Jane Doe'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckSquare className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Upcoming Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <h4 className="font-medium text-sm">{task.title}</h4>
                </div>
                <Badge className={getPriorityColor(task.priority)} variant="secondary">
                  {task.priority}
                </Badge>
              </div>
              <p className="text-xs text-gray-600">{task.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                <p className="text-xs text-gray-500">Assigned: {task.assignee}</p>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2">
                View Details
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
