
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/FileUpload';
import { RecentDocuments } from './RecentDocuments';
import { RecentClients } from './RecentClients';
import { Upload, FileText, Users, Activity, TrendingUp, Shield, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const HomePage = () => {
  const navigate = useNavigate();

  const handleDocumentSelect = (documentId: string) => {
    navigate(`/document/${documentId}`);
  };

  const handleClientSelect = (clientId: string) => {
    navigate(`/client/${clientId}`);
  };

  const handleUploadComplete = async (documentId: string) => {
    // Navigate to the document viewer after upload
    navigate('/trustee/dashboard', { 
      state: { 
        selectedDocument: documentId,
        documentTitle: 'Uploaded Document',
        isForm47: false
      } 
    });
  };

  const quickActions = [
    {
      title: "Upload New Document",
      description: "Add documents for AI analysis",
      icon: Upload,
      action: () => document.querySelector('input[type="file"]')?.click(),
      color: "bg-blue-500"
    },
    {
      title: "View Analytics",
      description: "Check performance metrics",
      icon: TrendingUp,
      action: () => navigate('/analytics'),
      color: "bg-green-500"
    },
    {
      title: "CRM Dashboard",
      description: "Manage client relationships",
      icon: Users,
      action: () => navigate('/crm'),
      color: "bg-purple-500"
    },
    {
      title: "AI Assistant",
      description: "Access SAFA AI tools",
      icon: Shield,
      action: () => navigate('/safa'),
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 rounded-2xl shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white">
                      SecureFiles AI Dashboard
                    </h1>
                    <p className="text-blue-100 text-lg mt-2">
                      Intelligent document management for Licensed Insolvency Trustees
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    AI-Powered Analysis
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <Shield className="h-4 w-4 mr-1" />
                    PIPEDA Compliant
                  </Badge>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="secondary"
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm h-auto p-4"
                      onClick={action.action}
                    >
                      <div className="text-center">
                        <action.icon className="h-6 w-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">{action.title}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Documents</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">24</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  +2 from last week
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Clients</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">12</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  +1 from last week
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Tasks</CardTitle>
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">8</div>
              <div className="flex items-center mt-2">
                <Clock className="h-4 w-4 text-orange-500 mr-1" />
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  -3 from yesterday
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Upload className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">32</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Files uploaded
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Mobile */}
        <div className="lg:hidden">
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 hover:shadow-md transition-all duration-200"
                    onClick={action.action}
                  >
                    <div className="text-center">
                      <div className={`p-3 ${action.color} rounded-lg mb-2 mx-auto w-fit`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-sm font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* File Upload Section */}
        <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Documents
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Drag and drop files or click to browse. AI analysis will begin automatically.
            </p>
          </CardHeader>
          <CardContent>
            <FileUpload onUploadComplete={handleUploadComplete} />
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Documents
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your recently accessed documents and analysis results
            </p>
          </CardHeader>
          <CardContent>
            <RecentDocuments onDocumentSelect={handleDocumentSelect} />
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Clients
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Clients with recent document activity
            </p>
          </CardHeader>
          <CardContent>
            <RecentClients onClientSelect={handleClientSelect} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
