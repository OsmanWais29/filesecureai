
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
  Workflow
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Upload Documents',
      description: 'Upload and analyze bankruptcy forms',
      icon: Upload,
      path: '/documents',
      color: 'bg-blue-500'
    },
    {
      title: 'Document Converter',
      description: 'Convert PDF documents to structured XML',
      icon: FileSearch,
      path: '/converter',
      color: 'bg-green-500'
    },
    {
      title: 'Manage Clients',
      description: 'View and manage client information',
      icon: Users,
      path: '/clients',
      color: 'bg-purple-500'
    },
    {
      title: 'Task Management',
      description: 'Track and manage your tasks',
      icon: CheckSquare,
      path: '/tasks',
      color: 'bg-orange-500'
    },
    {
      title: 'Analytics',
      description: 'View analytics and insights',
      icon: BarChart3,
      path: '/analytics',
      color: 'bg-indigo-500'
    },
    {
      title: 'Workflows',
      description: 'Manage automated workflows',
      icon: Workflow,
      path: '/workflows',
      color: 'bg-teal-500'
    }
  ];

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to SecureFiles AI</h1>
          <p className="text-xl text-gray-600">Your comprehensive bankruptcy document management platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action) => (
            <Card key={action.path} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${action.color} text-white`}>
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
                  Open {action.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Document Analysis Complete</p>
                    <p className="text-sm text-gray-600">Form 47 - Consumer Proposal</p>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">New Client Added</p>
                    <p className="text-sm text-gray-600">John Smith - Estate #12345</p>
                  </div>
                  <span className="text-xs text-gray-500">4 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Risk Assessment Generated</p>
                    <p className="text-sm text-gray-600">High priority issues detected</p>
                  </div>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Documents</span>
                  <span className="font-bold text-2xl">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Clients</span>
                  <span className="font-bold text-2xl">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pending Tasks</span>
                  <span className="font-bold text-2xl">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Forms Processed</span>
                  <span className="font-bold text-2xl">456</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;
