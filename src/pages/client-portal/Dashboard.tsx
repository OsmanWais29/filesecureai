
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  CheckSquare, 
  Calendar, 
  AlertCircle, 
  TrendingUp,
  Clock,
  User,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ClientDashboard = () => {
  const navigate = useNavigate();

  const quickStats = [
    {
      title: "Active Documents",
      value: "12",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+2 this week"
    },
    {
      title: "Pending Tasks",
      value: "3",
      icon: CheckSquare,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      change: "2 due soon"
    },
    {
      title: "Upcoming Appointments",
      value: "1",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "Next: Tomorrow"
    },
    {
      title: "Case Status",
      value: "Active",
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "In progress"
    }
  ];

  const recentActivity = [
    {
      title: "Document uploaded: Financial Statement",
      time: "2 hours ago",
      type: "document",
      status: "completed"
    },
    {
      title: "Task assigned: Review income details",
      time: "1 day ago",
      type: "task",
      status: "pending"
    },
    {
      title: "Appointment scheduled with trustee",
      time: "2 days ago",
      type: "appointment",
      status: "scheduled"
    },
    {
      title: "Monthly report generated",
      time: "3 days ago",
      type: "report",
      status: "completed"
    }
  ];

  const pendingTasks = [
    {
      title: "Submit updated income statement",
      dueDate: "Due Tomorrow",
      priority: "high",
      description: "Please provide your latest income documentation"
    },
    {
      title: "Review and sign consent form",
      dueDate: "Due in 3 days",
      priority: "medium",
      description: "Electronic signature required for processing"
    },
    {
      title: "Schedule follow-up meeting",
      dueDate: "Due in 1 week",
      priority: "low",
      description: "Coordinate with trustee for next consultation"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-blue-100 text-lg">
              Here's an overview of your case progress and important updates.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Tasks */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-gray-900">
              <CheckSquare className="h-5 w-5 mr-2 text-amber-600" />
              Pending Tasks
            </CardTitle>
            <CardDescription>
              Important items that require your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTasks.map((task, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  <div className="flex items-center mt-2">
                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-500">{task.dueDate}</span>
                  </div>
                </div>
                <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                  {task.priority}
                </Badge>
              </div>
            ))}
            <Button 
              onClick={() => navigate('/client-portal/tasks')}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
            >
              View All Tasks
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-gray-900">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates and changes to your case
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'document' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'task' ? 'bg-amber-100 text-amber-600' :
                    activity.type === 'appointment' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {activity.type === 'document' && <FileText className="h-4 w-4" />}
                    {activity.type === 'task' && <CheckSquare className="h-4 w-4" />}
                    {activity.type === 'appointment' && <Calendar className="h-4 w-4" />}
                    {activity.type === 'report' && <TrendingUp className="h-4 w-4" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
                <Badge variant={activity.status === 'completed' ? 'secondary' : 'outline'}>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts for your convenience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => navigate('/client-portal/documents')}
              variant="outline" 
              className="h-16 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 border-blue-200"
            >
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="font-medium">Upload Documents</span>
            </Button>
            <Button 
              onClick={() => navigate('/client-portal/appointments')}
              variant="outline" 
              className="h-16 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 border-green-200"
            >
              <Calendar className="h-6 w-6 text-green-600" />
              <span className="font-medium">Schedule Meeting</span>
            </Button>
            <Button 
              onClick={() => navigate('/client-portal/support')}
              variant="outline" 
              className="h-16 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 border-purple-200"
            >
              <AlertCircle className="h-6 w-6 text-purple-600" />
              <span className="font-medium">Get Support</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
