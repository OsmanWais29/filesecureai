
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, FileText, Users, Calendar, BarChart } from "lucide-react";

const SAFAPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">SAFA - Smart AI Financial Assistant</h1>
              <p className="text-muted-foreground">
                Your intelligent assistant for financial analysis and reporting
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Document Analysis
              </CardTitle>
              <CardDescription>
                AI-powered analysis of financial documents and forms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Start Analysis
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Client Management
              </CardTitle>
              <CardDescription>
                Manage client portfolios and financial profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Clients
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-purple-500" />
                Financial Reports
              </CardTitle>
              <CardDescription>
                Generate comprehensive financial reports and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Generate Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                Scheduled Tasks
              </CardTitle>
              <CardDescription>
                Automate recurring financial analysis tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Schedule
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-red-500" />
                AI Chat
              </CardTitle>
              <CardDescription>
                Chat with SAFA for instant financial insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-500" />
                Templates
              </CardTitle>
              <CardDescription>
                Access pre-built financial analysis templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Browse Templates
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest financial analysis activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="font-medium">Form 47 Analysis Completed</div>
                    <div className="text-sm text-muted-foreground">Client: John Doe • 2 hours ago</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Report
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <BarChart className="h-8 w-8 text-green-500" />
                  <div>
                    <div className="font-medium">Monthly Financial Report Generated</div>
                    <div className="text-sm text-muted-foreground">Portfolio Analysis • 1 day ago</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Users className="h-8 w-8 text-purple-500" />
                  <div>
                    <div className="font-medium">New Client Profile Created</div>
                    <div className="text-sm text-muted-foreground">Sarah Johnson • 3 days ago</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SAFAPage;
