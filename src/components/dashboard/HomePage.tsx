
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { RecentDocuments } from './RecentDocuments';
import { RecentClients } from './RecentClients';
import { FileText, Users, BarChart3, ArrowRight, Shield, Zap, Clock, ChevronRight } from 'lucide-react';
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
      description: "Upload, organize, and analyze your bankruptcy forms with AI-powered processing",
      icon: FileText,
      action: () => navigate('/documents'),
      color: "from-blue-600 to-indigo-600"
    },
    {
      title: "Client Relations",
      description: "Manage client data, track interactions, and maintain communication logs",
      icon: Users,
      action: () => navigate('/crm'),
      color: "from-emerald-600 to-teal-600"
    },
    {
      title: "Analytics Dashboard", 
      description: "Track performance metrics, compliance status, and business insights",
      icon: BarChart3,
      action: () => navigate('/activity'),
      color: "from-purple-600 to-violet-600"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "PIPEDA compliant with end-to-end encryption and secure Canadian data storage"
    },
    {
      icon: Zap,
      title: "AI-Powered Processing",
      description: "Intelligent form recognition, risk assessment, and automated compliance checking"
    },
    {
      icon: Clock,
      title: "Real-Time Collaboration",
      description: "Seamless team workflows with instant updates and integrated communication"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.2),transparent_50%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full text-blue-300 text-sm font-medium border border-blue-400/30">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                {getGreeting()}, {getUserName()}
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold text-white leading-tight tracking-tight">
                SecureFiles
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {" "}AI
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
                Professional insolvency management platform engineered for Licensed Insolvency Trustees. 
                <span className="text-white font-medium"> Advanced AI processing</span> meets enterprise-grade security.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                onClick={() => navigate('/documents')} 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 border-0"
              >
                <FileText className="h-6 w-6 mr-3" />
                Start Processing Documents
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/crm')}
                size="lg"
                className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 hover:border-white/50"
              >
                <Users className="h-6 w-6 mr-3" />
                Access Client Portal
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 space-y-24">
        {/* Features Section */}
        <div className="text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Built for Professional Excellence
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Experience the future of insolvency management with our comprehensive suite of AI-powered tools
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm hover:bg-white">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="inline-flex p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
                    <feature.icon className="h-10 w-10 text-blue-600" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
              Intelligent Document Processing
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Upload and analyze bankruptcy forms with our advanced AI engine. Get instant compliance insights and risk assessments.
            </p>
          </div>
          
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-1">
              <div className="bg-white rounded-lg p-10">
                <FileUpload onUploadComplete={handleUploadComplete} />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
              Platform Access
            </h2>
            <p className="text-xl text-slate-600">
              Navigate to your essential tools and workflows
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white/90 backdrop-blur-sm hover:bg-white hover:-translate-y-2"
                onClick={action.action}
              >
                <CardContent className="p-0">
                  <div className={`h-2 bg-gradient-to-r ${action.color}`}></div>
                  <div className="p-8 space-y-6">
                    <div className="flex items-start space-x-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${action.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="h-8 w-8" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-6 w-6 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-300 mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
              Recent Activity
            </h2>
            <p className="text-xl text-slate-600">
              Quick access to your latest work and client interactions
            </p>
          </div>
          
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-xl p-1 h-14">
                  <TabsTrigger 
                    value="documents" 
                    className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200 text-base font-medium"
                  >
                    <FileText className="h-5 w-5" />
                    Recent Documents
                  </TabsTrigger>
                  <TabsTrigger 
                    value="clients" 
                    className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200 text-base font-medium"
                  >
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
    </div>
  );
};
