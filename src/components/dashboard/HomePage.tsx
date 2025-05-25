
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { RecentDocuments } from './RecentDocuments';
import { RecentClients } from './RecentClients';
import { Upload, FileText, Users, Activity, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from '@/contexts/SessionContext';

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
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-primary to-secondary border-b border-border/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              {getGreeting()}, {getUserName()}!
            </h1>
            <p className="text-blue-100 text-lg">
              Welcome back! The All-in-One Intelligent Workspace for Insolvency
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 dark:bg-gray-800/80 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-blue-200 group-hover:scale-110 transition-all duration-300">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors">Documents</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-blue-700 transition-colors">156</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 dark:bg-gray-800/80 dark:hover:from-green-900/20 dark:hover:to-green-800/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:shadow-green-200 group-hover:scale-110 transition-all duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-green-600 transition-colors">Clients</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-green-700 transition-colors">24</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 dark:bg-gray-800/80 dark:hover:from-orange-900/20 dark:hover:to-orange-800/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-orange-200 group-hover:scale-110 transition-all duration-300">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-orange-600 transition-colors">Tasks</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-orange-700 transition-colors">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 dark:bg-gray-800/80 dark:hover:from-purple-900/20 dark:hover:to-purple-800/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-purple-200 group-hover:scale-110 transition-all duration-300">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-purple-600 transition-colors">Security</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-purple-700 transition-colors">98%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Upload className="h-5 w-5" />
              Upload Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <FileUpload onUploadComplete={handleUploadComplete} />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg">
            <CardTitle className="text-primary">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700">
                <TabsTrigger value="documents" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <FileText className="h-4 w-4" />
                  Recent Documents
                </TabsTrigger>
                <TabsTrigger value="clients" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
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
