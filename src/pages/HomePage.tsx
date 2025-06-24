
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Upload,
  FileSearch,
  CheckSquare,
  Workflow,
  MessageSquare,
  DollarSign,
  Activity,
  FileCode,
  Shield,
  Calendar,
  Bell
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Document Analysis',
      description: 'AI-powered bankruptcy form analysis',
      icon: FileText,
      path: '/trustee/documents',
      color: 'bg-blue-500'
    },
    {
      title: 'SAFA AI Assistant',
      description: 'Smart AI Financial Assistant',
      icon: MessageSquare,
      path: '/safa',
      color: 'bg-purple-500'
    },
    {
      title: 'Client Management',
      description: 'CRM and client relationship tools',
      icon: Users,
      path: '/trustee/crm',
      color: 'bg-green-500'
    },
    {
      title: 'PDF to XML Converter',
      description: 'Convert documents to structured data',
      icon: FileCode,
      path: '/converter',
      color: 'bg-orange-500'
    },
    {
      title: 'Income & Expense',
      description: 'Smart surplus income monitoring',
      icon: DollarSign,
      path: '/income-expense',
      color: 'bg-emerald-500'
    },
    {
      title: 'Risk Assessment',
      description: 'Compliance and analytics dashboard',
      icon: BarChart3,
      path: '/trustee/analytics',
      color: 'bg-red-500'
    },
    {
      title: 'Audit Trail',
      description: 'Security and compliance tracking',
      icon: Activity,
      path: '/audit',
      color: 'bg-indigo-500'
    },
    {
      title: 'Task Management',
      description: 'Track and manage workflows',
      icon: CheckSquare,
      path: '/tasks',
      color: 'bg-teal-500'
    }
  ];

  const recentActivity = [
    { 
      action: "Form 47 Analysis Completed", 
      client: "John Smith - Estate #12345", 
      time: "2 hours ago",
      type: "analysis"
    },
    { 
      action: "New Client Onboarded", 
      client: "Sarah Johnson - Consumer Proposal", 
      time: "4 hours ago",
      type: "client"
    },
    { 
      action: "Risk Assessment Generated", 
      client: "Mike Wilson - High Priority Review", 
      time: "1 day ago",
      type: "risk"
    },
    { 
      action: "Monthly Report Generated", 
      client: "Portfolio Analysis - June 2024", 
      time: "2 days ago",
      type: "report"
    }
  ];

  const stats = [
    { title: "Active Cases", value: "127", change: "+12 this month", icon: Users },
    { title: "Documents Processed", value: "1,247", change: "+89 this week", icon: FileText },
    { title: "AI Analyses", value: "456", change: "+67 today", icon: MessageSquare },
    { title: "Compliance Score", value: "98%", change: "+2% improvement", icon: Shield }
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SecureFiles AI
              </h1>
              <p className="text-gray-600">Licensed Insolvency Trustee Professional Portal</p>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive bankruptcy document management, AI-powered analysis, and client relationship tools for licensed professionals
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${action.color} text-white group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{action.description}</p>
                <Button 
                  onClick={() => navigate(action.path)}
                  className="w-full"
                >
                  Access {action.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
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
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.client}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/trustee/notifications')}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  View Notifications (12 new)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/trustee/calendar')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Today's Schedule (6 meetings)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/trustee/reports')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Reports
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;
