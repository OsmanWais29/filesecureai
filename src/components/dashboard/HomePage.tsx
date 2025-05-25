
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { RecentDocuments } from './RecentDocuments';
import { RecentClients } from './RecentClients';
import { FileText, Users, TrendingUp, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from '@/contexts/SessionContext';
import { Separator } from '@/components/ui/separator';

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useSessionContext();
  const [activeTab, setActiveTab] = useState('documents');

  const handleDocumentSelect = (documentId: string) => {
    navigate(`/document/${documentId}`);
  };

  const handleClientSelect = (clientId: string) => {
    navigate(`/client/${clientId}`);
  };

  const handleUploadComplete = async (documentId: string) => {
    navigate('/trustee/dashboard', { 
      state: { 
        selectedDocument: documentId,
        documentTitle: 'Uploaded Document',
        isForm47: false
      } 
    });
  };

  // Get user's first name or fallback to "User"
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
    return 'User';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickStats = [
    {
      title: "Active Cases",
      value: "24",
      description: "Currently in progress",
      icon: FileText,
      trend: "+12%"
    },
    {
      title: "Clients Served",
      value: "156",
      description: "This quarter",
      icon: Users,
      trend: "+8%"
    },
    {
      title: "Compliance Rate",
      value: "98.5%",
      description: "Meeting all standards",
      icon: Shield,
      trend: "+2.1%"
    },
    {
      title: "Processing Time",
      value: "4.2 days",
      description: "Average document review",
      icon: TrendingUp,
      trend: "-15%"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {getGreeting()}, {getUserName()}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              SecureFiles AI - Professional Insolvency Management Platform
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <stat.icon className="h-5 w-5 text-primary" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {stat.title}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {stat.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      stat.trend.startsWith('+') ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Document Upload Section */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
              Document Management
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-300">
              Upload and process documents with AI-powered analysis
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <FileUpload onUploadComplete={handleUploadComplete} />
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Recent Activity Section */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
              Recent Activity
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-300">
              Quick access to your latest documents and clients
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-700">
                <TabsTrigger 
                  value="documents" 
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600"
                >
                  <FileText className="h-4 w-4" />
                  Recent Documents
                </TabsTrigger>
                <TabsTrigger 
                  value="clients" 
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600"
                >
                  <Users className="h-4 w-4" />
                  Recent Clients
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="documents" className="mt-6">
                <RecentDocuments onDocumentSelect={handleDocumentSelect} />
              </TabsContent>
              
              <TabsContent value="clients" className="mt-6">
                <RecentClients onClientSelect={handleClientSelect} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
