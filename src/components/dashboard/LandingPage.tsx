
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, FileText, TrendingUp, ArrowRight, LogIn } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            SecureFiles <span className="text-blue-600">AI</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional insolvency management platform for Licensed Insolvency Trustees and their clients
          </p>
        </div>

        {/* Portal Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <Card className="border-2 hover:border-blue-500 transition-colors cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit group-hover:bg-blue-200 transition-colors">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Trustee Portal</CardTitle>
              <CardDescription className="text-lg">
                For Licensed Insolvency Trustees and their teams
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={() => navigate('/login')}
                className="w-full mb-4 group-hover:bg-blue-700 transition-colors"
                size="lg"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Access Trustee Portal
              </Button>
              <p className="text-sm text-gray-500">
                Manage cases, analyze documents, and collaborate with your team
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-500 transition-colors cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit group-hover:bg-green-200 transition-colors">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Client Portal</CardTitle>
              <CardDescription className="text-lg">
                For clients working with Licensed Insolvency Trustees
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={() => navigate('/client-login')}
                className="w-full mb-4 bg-green-600 hover:bg-green-700 transition-colors"
                size="lg"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Access Client Portal
              </Button>
              <p className="text-sm text-gray-500">
                Track your case progress and communicate with your trustee
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="mx-auto mb-4 p-3 bg-indigo-100 rounded-full w-fit">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-600">
              Automated document analysis and risk assessment using advanced AI
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure & Compliant</h3>
            <p className="text-gray-600">
              Bank-level security with full regulatory compliance
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Streamlined Workflow</h3>
            <p className="text-gray-600">
              Efficient case management with automated workflows
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
