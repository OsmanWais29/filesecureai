
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { RecentDocuments } from './RecentDocuments';
import { RecentClients } from './RecentClients';
import { FileText, Users, BarChart3, ArrowRight, Plus, Upload, Clock, Shield, Zap } from 'lucide-react';
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

  const features = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and PIPEDA compliance"
    },
    {
      icon: Zap,
      title: "AI-Powered Analysis",
      description: "Intelligent document processing and risk assessment"
    },
    {
      icon: Clock,
      title: "Real-time Collaboration",
      description: "Seamless team workflows and instant updates"
    }
  ];

  const quickActions = [
    {
      title: "Document Management",
      description: "Organize and analyze your documents",
      icon: FileText,
      action: () => navigate('/documents'),
      gradient: "from-blue-600 to-blue-700"
    },
    {
      title: "Client Relations",
      description: "Manage client data and communications",
      icon: Users,
      action: () => navigate('/crm'),
      gradient: "from-emerald-600 to-emerald-700"
    },
    {
      title: "Analytics Dashboard",
      description: "Track performance and insights",
      icon: BarChart3,
      action: () => navigate('/activity'),
      gradient: "from-purple-600 to-purple-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <p className="text-blue-400 font-medium text-lg tracking-wide">
                {getGreeting()}, {getUserName()}
              </p>
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                SecureFiles
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {" "}AI
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Professional insolvency management platform powered by artificial intelligence. 
                Streamline your workflow with advanced document processing and compliance tools.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => navigate('/documents')} 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <FileText className="h-5 w-5 mr-2" />
                Access Documents
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/crm')}
                size="lg"
                className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300"
              >
                <Users className="h-5 w-5 mr-2" />
                Client Portal
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
        {/* Features Section */}
        <div className="text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Built for Professional Excellence
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Experience the future of insolvency management with our comprehensive suite of tools
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="inline-flex p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                      <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Document Processing Center
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Upload and analyze documents with our AI-powered processing engine
            </p>
          </div>
          
          <Card className="border-0 shadow-xl bg-white dark:bg-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
                <FileUpload onUploadComplete={handleUploadComplete} />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Quick Access
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Navigate to your most-used tools and features
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white dark:bg-gray-800"
                onClick={action.action}
              >
                <CardContent className="p-0">
                  <div className={`h-2 bg-gradient-to-r ${action.gradient}`}></div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${action.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Quick access to your latest work and interactions
            </p>
          </div>
          
          <Card className="border-0 shadow-xl bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <TabsTrigger 
                    value="documents" 
                    className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 rounded-md transition-all duration-200"
                  >
                    <FileText className="h-4 w-4" />
                    Documents
                  </TabsTrigger>
                  <TabsTrigger 
                    value="clients" 
                    className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 rounded-md transition-all duration-200"
                  >
                    <Users className="h-4 w-4" />
                    Clients
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
    </div>
  );
};
