
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, Upload, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const EFilingPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <FileCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">E-Filing & Audit Trail</h1>
              <p className="text-muted-foreground">
                Electronic filing system with comprehensive audit tracking
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common e-filing tasks and operations</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-20 flex flex-col gap-2">
                  <Upload className="h-6 w-6" />
                  <span>Submit New Filing</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <FileCheck className="h-6 w-6" />
                  <span>Check Filing Status</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <CheckCircle className="h-6 w-6" />
                  <span>View Completed</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Clock className="h-6 w-6" />
                  <span>Pending Approvals</span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Filings</CardTitle>
                <CardDescription>Your latest e-filing activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: "F001", title: "Form 47 - Consumer Proposal", client: "John Doe", status: "completed", date: "2024-01-15" },
                    { id: "F002", title: "Form 31 - Statement of Affairs", client: "Jane Smith", status: "pending", date: "2024-01-14" },
                    { id: "F003", title: "Form 65 - Assignment", client: "Bob Johnson", status: "in_review", date: "2024-01-13" },
                    { id: "F004", title: "Form 76 - Trustee Report", client: "Alice Brown", status: "rejected", date: "2024-01-12" },
                  ].map((filing) => (
                    <div key={filing.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <FileCheck className="h-8 w-8 text-blue-500" />
                        <div>
                          <div className="font-medium">{filing.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Client: {filing.client} • Filed: {filing.date}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          filing.status === 'completed' ? 'default' :
                          filing.status === 'pending' ? 'secondary' :
                          filing.status === 'in_review' ? 'outline' : 'destructive'
                        }>
                          {filing.status.replace('_', ' ')}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Filing Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Filings</span>
                  <span className="font-semibold">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="font-semibold">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-semibold text-orange-600">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-semibold text-green-600">119</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">E-Filing System Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Audit Trail Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Maintenance Window: 2 AM - 4 AM</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  OSB Guidelines
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Filing Templates
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Support Center
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Training Materials
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EFilingPage;
