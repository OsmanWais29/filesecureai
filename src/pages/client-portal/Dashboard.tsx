
import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, CheckSquare, AlertCircle, Clock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ClientDashboard = () => {
  const { user } = useAuthState();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'Client';
  };

  const quickActions = [
    {
      title: "View Documents",
      description: "Access your case documents",
      icon: FileText,
      path: "/portal/documents",
      color: "bg-blue-500"
    },
    {
      title: "Check Tasks",
      description: "See your assigned tasks",
      icon: CheckSquare,
      path: "/portal/tasks",
      color: "bg-green-500"
    },
    {
      title: "Schedule Appointment",
      description: "Book time with your trustee",
      icon: Calendar,
      path: "/portal/appointments",
      color: "bg-purple-500"
    }
  ];

  const recentActivity = [
    {
      type: "document",
      title: "Form 47 uploaded",
      description: "Consumer proposal document added",
      time: "2 hours ago",
      status: "completed"
    },
    {
      type: "task",
      title: "Income verification required",
      description: "Please provide recent pay stubs",
      time: "1 day ago",
      status: "pending"
    },
    {
      type: "appointment",
      title: "Meeting scheduled",
      description: "Consultation on March 15th",
      time: "3 days ago",
      status: "scheduled"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center px-3 py-1 bg-primary/10 rounded-full text-sm text-primary">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            {greeting}, {getUserName()}
          </div>
        </div>
        <h1 className="text-3xl font-bold">Client Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your secure client portal. Here you can track your case progress and access important documents.
        </p>
      </div>

      {/* Case Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Case Overview
          </CardTitle>
          <CardDescription>Your current case status and next steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Documents Submitted</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-500">2</div>
              <div className="text-sm text-muted-foreground">Pending Tasks</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-500">85%</div>
              <div className="text-sm text-muted-foreground">Case Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and frequently accessed areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-3 hover:shadow-md transition-shadow"
                onClick={() => navigate(action.path)}
              >
                <div className={`p-3 rounded-lg ${action.color} text-white`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest updates on your case</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-3 rounded-lg border">
                <div className="mt-1">
                  {activity.type === 'document' && <FileText className="h-4 w-4 text-blue-500" />}
                  {activity.type === 'task' && <CheckSquare className="h-4 w-4 text-orange-500" />}
                  {activity.type === 'appointment' && <Calendar className="h-4 w-4 text-purple-500" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{activity.title}</h4>
                    <Badge variant={activity.status === 'pending' ? 'destructive' : 'secondary'}>
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800 dark:text-orange-200">Action Required</h4>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Please submit your income verification documents by March 20th to keep your case on track.
              </p>
              <Button size="sm" className="mt-3" onClick={() => navigate('/portal/tasks')}>
                View Tasks
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;
