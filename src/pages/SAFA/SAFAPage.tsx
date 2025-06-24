
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Bot, FileText, Users } from 'lucide-react';

const SAFAPage = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">SAFA AI Assistant</h1>
          <p className="text-gray-600 mt-1">SecureFiles AI Assistant for document analysis and client management.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Chat Interface
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6 h-96 flex items-center justify-center">
                <div className="text-center">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">AI Assistant interface will be implemented here</p>
                  <p className="text-sm text-gray-500 mt-2">Chat with SAFA for document analysis and insights</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Analyze Document</div>
                  <div className="text-sm text-gray-500">Upload and analyze forms</div>
                </button>
                <button className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Risk Assessment</div>
                  <div className="text-sm text-gray-500">Generate risk reports</div>
                </button>
                <button className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Client Insights</div>
                  <div className="text-sm text-gray-500">Get client recommendations</div>
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent activity</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SAFAPage;
