
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

  const handleStatsCardClick = (type: string) => {
    switch (type) {
      case 'documents':
        navigate('/documents');
        break;
      case 'clients':
        navigate('/crm');
        break;
      case 'tasks':
        navigate('/crm', { state: { activeTab: 'tasks' } });
        break;
      case 'security':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-primary to-secondary border-b border-border/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-3">
              {getGreeting()}, {getUserName()}!
            </h1>
            <p className="text-blue-100 text-xl">
              Welcome back! The All-in-One Intelligent Workspace for Insolvency
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards - Made Larger */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <Card 
            className="group hover:shadow-2xl hover:scale-110 transition-all duration-500 cursor-pointer border-0 bg-white/90 backdrop-blur-sm hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 dark:bg-gray-800/90 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 transform hover:-translate-y-2"
            onClick={() => handleStatsCardClick('documents')}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-blue-300 group-hover:scale-125 transition-all duration-500">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors font-medium">Documents</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-blue-700 transition-colors">156</p>
                  <p className="text-xs text-green-600 font-medium">+12 this week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="group hover:shadow-2xl hover:scale-110 transition-all duration-500 cursor-pointer border-0 bg-white/90 backdrop-blur-sm hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 dark:bg-gray-800/90 dark:hover:from-green-900/30 dark:hover:to-green-800/30 transform hover:-translate-y-2"
            onClick={() => handleStatsCardClick('clients')}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg group-hover:shadow-green-300 group-hover:scale-125 transition-all duration-500">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-green-600 transition-colors font-medium">Clients</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-green-700 transition-colors">24</p>
                  <p className="text-xs text-green-600 font-medium">+3 this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="group hover:shadow-2xl hover:scale-110 transition-all duration-500 cursor-pointer border-0 bg-white/90 backdrop-blur-sm hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 dark:bg-gray-800/90 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 transform hover:-translate-y-2"
            onClick={() => handleStatsCardClick('tasks')}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg group-hover:shadow-orange-300 group-hover:scale-125 transition-all duration-500">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-orange-600 transition-colors font-medium">Tasks</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-orange-700 transition-colors">8</p>
                  <p className="text-xs text-orange-600 font-medium">2 high priority</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="group hover:shadow-2xl hover:scale-110 transition-all duration-500 cursor-pointer border-0 bg-white/90 backdrop-blur-sm hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 dark:bg-gray-800/90 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 transform hover:-translate-y-2"
            onClick={() => handleStatsCardClick('security')}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-purple-300 group-hover:scale-125 transition-all duration-500">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-purple-600 transition-colors font-medium">Security</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-purple-700 transition-colors">98%</p>
                  <p className="text-xs text-green-600 font-medium">Excellent status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section - Made Bigger */}
        <Card className="mb-10 border-0 bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg py-8">
            <CardTitle className="flex items-center gap-3 text-primary text-2xl">
              <Upload className="h-7 w-7" />
              Upload Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="transform scale-110">
              <FileUpload onUploadComplete={handleUploadComplete} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg py-8">
            <CardTitle className="text-primary text-2xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700 h-12">
                <TabsTrigger value="documents" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white text-base">
                  <FileText className="h-5 w-5" />
                  Recent Documents
                </TabsTrigger>
                <TabsTrigger value="clients" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white text-base">
                  <Users className="h-5 w-5" />
                  Recent Clients
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="documents" className="mt-8">
                <RecentDocuments onDocumentSelect={handleDocumentSelect} />
              </TabsContent>
              
              <TabsContent value="clients" className="mt-8">
                <RecentClients onClientSelect={handleClientSelect} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
