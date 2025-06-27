
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, TrendingUp, Shield, LogOut } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuthState } from '@/hooks/useAuthState';
import { toast } from 'sonner';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthState();

  const handleSignOut = async () => {
    try {
      console.log("Signing out from HomePage");
      await signOut();
      toast.success('Signed out successfully');
      navigate('/trustee-login', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const features = [
    {
      icon: FileText,
      title: "Document Management",
      description: "Organize and analyze documents with AI-powered insights",
      link: "/documents"
    },
    {
      icon: Users,
      title: "Client Portal",
      description: "Manage client relationships and communications",
      link: "/crm"
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      description: "Track performance and generate detailed reports",
      link: "/analytics"
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Maintain audit trails and ensure regulatory compliance",
      link: "/audit"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to SecureFiles AI
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your comprehensive trustee management platform
            </p>
            {user && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Logged in as: {user.email}
              </p>
            )}
          </div>
          
          {/* Sign Out Button */}
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(feature.link)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Access Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={() => navigate('/documents')} size="lg">
            <FileText className="mr-2 h-4 w-4" />
            View Documents
          </Button>
          <Button onClick={() => navigate('/crm')} variant="outline" size="lg">
            <Users className="mr-2 h-4 w-4" />
            Client Management
          </Button>
          <Button onClick={() => navigate('/client-login')} variant="secondary" size="lg">
            Client Portal Access
          </Button>
        </div>

        {/* Test Authentication Section */}
        <Card className="mt-8 max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Test Authentication</CardTitle>
            <CardDescription>
              You can test the client portal by accessing the client login page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate('/client-login')} 
              className="w-full"
              variant="outline"
            >
              Go to Client Login
            </Button>
            <Button 
              onClick={() => navigate('/trustee-login')} 
              className="w-full"
              variant="outline"
            >
              Go to Trustee Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
