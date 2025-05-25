
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { RecentDocuments } from './RecentDocuments';
import { RecentClients } from './RecentClients';
import { Upload, FileText, Users, Activity } from 'lucide-react';
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
      {/* Simple Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              SecureFiles AI
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Intelligent document management for Licensed Insolvency Trustees
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Documents</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">156</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Clients</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">24</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tasks</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Upload className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">+12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload onUploadComplete={handleUploadComplete} />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
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
