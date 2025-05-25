
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Clean Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              SecureFiles AI
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Intelligent document management for Licensed Insolvency Trustees
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Overview */}
        <StatsGrid />

        {/* Main Actions Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Document Upload - Main Feature */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Upload className="h-6 w-6 text-blue-600" />
                  Upload Documents
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload and analyze your bankruptcy and insolvency documents
                </p>
              </CardHeader>
              <CardContent>
                <FileUpload onUploadComplete={handleUploadComplete} />
              </CardContent>
            </Card>
          </div>

          {/* Quick Overview Cards */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      This Week
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      +12
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Documents processed
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Clients
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      24
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Under management
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              Your latest documents and client interactions
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Recent Documents
                </TabsTrigger>
                <TabsTrigger value="clients" className="flex items-center gap-2">
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
