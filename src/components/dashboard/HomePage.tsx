
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { RecentDocuments } from './RecentDocuments';
import { RecentClients } from './RecentClients';
import { FileText, Users, Upload, ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from '@/contexts/SessionContext';
import { Button } from '@/components/ui/button';

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

  const quickActions = [
    {
      title: "Document Management",
      description: "View and organize all your documents",
      icon: FileText,
      action: () => navigate('/documents'),
      color: "bg-blue-500"
    },
    {
      title: "Client Portal",
      description: "Manage clients and relationships",
      icon: Users,
      action: () => navigate('/crm'),
      color: "bg-green-500"
    },
    {
      title: "Activity Center",
      description: "Track financial data and analytics",
      icon: Upload,
      action: () => navigate('/activity'),
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {getGreeting()}, {getUserName()}
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Welcome to SecureFiles AI - Your Professional Insolvency Management Platform
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button 
                onClick={() => navigate('/documents')} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <FileText className="h-5 w-5 mr-2" />
                View Documents
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/crm')}
                className="px-8 py-3 rounded-lg text-lg font-medium border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <Users className="h-5 w-5 mr-2" />
                Manage Clients
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Upload Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Upload Documents</h2>
                <p className="text-blue-100 mt-1">
                  Drag and drop files or click to browse - AI analysis included
                </p>
              </div>
              <div className="hidden md:block">
                <Upload className="h-8 w-8 text-white opacity-80" />
              </div>
            </div>
          </div>
          <div className="p-8">
            <FileUpload onUploadComplete={handleUploadComplete} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Quick Actions
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Access your most used features with one click
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white dark:bg-slate-800 overflow-hidden"
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`${action.color} p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {action.description}
                      </p>
                      <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium pt-2 group-hover:translate-x-1 transition-transform duration-200">
                        Get started <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="border-b border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Recent Activity
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Quick access to your latest documents and clients
            </p>
          </div>
          
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <TabsTrigger 
                  value="documents" 
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 rounded-md transition-all duration-200"
                >
                  <FileText className="h-4 w-4" />
                  Recent Documents
                </TabsTrigger>
                <TabsTrigger 
                  value="clients" 
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 rounded-md transition-all duration-200"
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
          </div>
        </div>
      </div>
    </div>
  );
};
