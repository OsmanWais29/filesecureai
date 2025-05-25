
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { RecentDocuments } from './RecentDocuments';
import { RecentClients } from './RecentClients';
import { FileText, Users, BarChart3, ArrowRight, Shield, Zap, Clock } from 'lucide-react';
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
      description: "Upload and analyze bankruptcy forms",
      icon: FileText,
      action: () => navigate('/documents'),
      color: "bg-blue-500"
    },
    {
      title: "Client Relations",
      description: "Manage client data and interactions",
      icon: Users,
      action: () => navigate('/crm'),
      color: "bg-emerald-500"
    },
    {
      title: "Analytics Dashboard", 
      description: "View performance metrics",
      icon: BarChart3,
      action: () => navigate('/activity'),
      color: "bg-purple-500"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "PIPEDA compliant with Canadian data storage"
    },
    {
      icon: Zap,
      title: "AI-Powered",
      description: "Intelligent document processing and analysis"
    },
    {
      icon: Clock,
      title: "Real-Time",
      description: "Instant updates and collaboration"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center px-3 py-1 bg-blue-500/20 rounded-full text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              {getGreeting()}, {getUserName()}
            </div>
            
            <h1 className="text-5xl font-bold">
              SecureFiles <span className="text-blue-400">AI</span>
            </h1>
            
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Professional insolvency management platform for Licensed Insolvency Trustees
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button 
                onClick={() => navigate('/documents')} 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                <FileText className="h-5 w-5 mr-2" />
                Start Processing
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/crm')}
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8"
              >
                <Users className="h-5 w-5 mr-2" />
                Client Portal
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="inline-flex p-3 rounded-lg bg-blue-50">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload Section */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
            <div className="text-center space-y-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upload Documents</h2>
              <p className="text-gray-600">Analyze bankruptcy forms with AI-powered processing</p>
            </div>
            <FileUpload onUploadComplete={handleUploadComplete} />
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Quick Access</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{action.description}</p>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4 mb-6">
              <h2 className="text-2xl font-bold">Recent Activity</h2>
              <p className="text-gray-600">Quick access to your latest work</p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="clients" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Clients
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="documents">
                <RecentDocuments onDocumentSelect={handleDocumentSelect} />
              </TabsContent>
              
              <TabsContent value="clients">
                <RecentClients onClientSelect={handleClientSelect} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
