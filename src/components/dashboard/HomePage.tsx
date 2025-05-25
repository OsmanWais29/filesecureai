
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { RecentDocuments } from './RecentDocuments';
import { RecentClients } from './RecentClients';
import { Upload, FileText, Users } from 'lucide-react';
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
        {/* Upload Section - Made Bigger */}
        <Card className="mb-10 border-0 bg-white/90 backdrop-blur-sm shadow-xl">
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
