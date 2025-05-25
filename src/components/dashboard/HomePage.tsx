
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { RecentDocuments } from './RecentDocuments';
import { RecentClients } from './RecentClients';
import { StatsGrid } from './StatsGrid';
import { Upload, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="space-y-6">
        {/* Redesigned Compact Header */}
        <div className="relative">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-8">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  SecureFiles AI
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Streamline your document management with{' '}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">intelligent AI-powered tools</span>
              </p>
              
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                <div className="w-12 h-0.5 bg-gradient-to-l from-blue-500 to-purple-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <StatsGrid />

        {/* File Upload */}
        <Card className="shadow-lg border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <Upload className="h-5 w-5" />
              </div>
              Upload Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload onUploadComplete={handleUploadComplete} />
          </CardContent>
        </Card>

        {/* Recent Items Tabs */}
        <Card className="shadow-lg border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 dark:bg-gray-700/50">
                <TabsTrigger value="documents" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                  <FileText className="h-4 w-4" />
                  Recent Documents
                </TabsTrigger>
                <TabsTrigger value="clients" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
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
