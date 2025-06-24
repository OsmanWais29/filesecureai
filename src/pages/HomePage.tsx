
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  BarChart3, 
  CheckSquare,
  MessageSquare,
  DollarSign,
  Activity,
  FileCode,
  Shield,
  Calendar,
  Bell,
  AlertTriangle,
  TrendingUp,
  Clock,
  FileBarChart
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const stats = [
    { 
      title: "Active Cases", 
      value: "127", 
      change: "+12 this month", 
      icon: Users,
      color: "text-blue-600"
    },
    { 
      title: "Documents Processed", 
      value: "1,247", 
      change: "+89 this week", 
      icon: FileText,
      color: "text-green-600"
    },
    { 
      title: "AI Analyses", 
      value: "456", 
      change: "+67 today", 
      icon: MessageSquare,
      color: "text-purple-600"
    },
    { 
      title: "Compliance Score", 
      value: "98%", 
      change: "+2% improvement", 
      icon: Shield,
      color: "text-emerald-600"
    }
  ];

  const recentActivity = [
    { 
      action: "Form 47 Analysis Completed", 
      client: "John Smith - Estate #12345", 
      time: "2 hours ago",
      type: "analysis",
      status: "completed"
    },
    { 
      action: "New Client Onboarded", 
      client: "Sarah Johnson - Consumer Proposal", 
      time: "4 hours ago",
      type: "client",
      status: "new"
    },
    { 
      action: "Risk Assessment Generated", 
      client: "Mike Wilson - High Priority Review", 
      time: "1 day ago",
      type: "risk",
      status: "attention"
    },
    { 
      action: "Monthly Report Generated", 
      client: "Portfolio Analysis - June 2024", 
      time: "2 days ago",
      type: "report",
      status: "completed"
    }
  ];

  const urgentTasks = [
    { task: "Review Form 65 - Estate #12456", deadline: "Today", priority: "high" },
    { task: "Client Meeting - Sarah Johnson", deadline: "Tomorrow", priority: "medium" },
    { task: "BIA Compliance Review", deadline: "This Week", priority: "high" },
    { task: "Monthly Surplus Income Report", deadline: "Friday", priority: "medium" }
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back to SecureFiles AI - Licensed Insolvency Trustee Portal</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/trustee/notifications')}
              className="relative"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>
            <Button onClick={() => navigate('/trustee/calendar')}>
              <Calendar className="h-4 w-4 mr-2" />
              Today's Schedule
            </Button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-600">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'completed' ? 'bg-green-500' :
                        activity.status === 'attention' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.client}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Urgent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Urgent Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {urgentTasks.map((task, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{task.deadline}</span>
                    </div>
                    <p className="text-sm font-medium">{task.task}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/trustee/documents')}
              >
                <FileText className="h-6 w-6" />
                <span className="text-sm">Analyze Document</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/safa')}
              >
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm">SAFA Assistant</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/income-expense')}
              >
                <DollarSign className="h-6 w-6" />
                <span className="text-sm">Income Analysis</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/trustee/reports')}
              >
                <FileBarChart className="h-6 w-6" />
                <span className="text-sm">Generate Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default HomePage;
