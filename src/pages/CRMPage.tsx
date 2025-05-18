
import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrmAnalytics } from "@/components/analytics/crm/CrmAnalytics";
import { Plus, Users, Clock, ListChecks, User } from "lucide-react";
import { ClientStats } from "@/components/crm/page/ClientStats";
import { CRMHeader } from "@/components/crm/page/CRMHeader";
import { CRMTabs } from "@/components/crm/page/CRMTabs";

// Mock data for clients
const CLIENTS = [
  {
    id: "1",
    name: "John Doe",
    company: "ABC Corp",
    email: "john@example.com",
    phone: "(555) 123-4567",
    status: "Active",
    lastContact: "2025-05-15T10:30:00Z"
  },
  {
    id: "2",
    name: "Jane Smith",
    company: "XYZ Industries",
    email: "jane@example.com",
    phone: "(555) 987-6543",
    status: "Pending",
    lastContact: "2025-05-12T14:15:00Z"
  },
  {
    id: "3",
    name: "Robert Johnson",
    company: "Johnson & Co",
    email: "robert@example.com",
    phone: "(555) 456-7890",
    status: "Inactive",
    lastContact: "2025-05-01T09:00:00Z"
  }
];

// Mock data for recent activities
const RECENT_ACTIVITIES = [
  { id: "act1", client: "John Doe", activity: "Document uploaded", date: "2025-05-18T09:30:00Z" },
  { id: "act2", client: "Jane Smith", activity: "Comment added", date: "2025-05-17T15:45:00Z" },
  { id: "act3", client: "Robert Johnson", activity: "Meeting scheduled", date: "2025-05-17T11:20:00Z" },
  { id: "act4", client: "John Doe", activity: "Task completed", date: "2025-05-16T13:10:00Z" }
];

// Format date to a readable string
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric' 
  }).format(date);
};

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [clientDialogOpen, setClientDialogOpen] = useState(false);

  const openClientDialog = () => {
    setClientDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="container py-6">
        <CRMHeader openClientDialog={openClientDialog} />
        
        <ClientStats />

        <div className="mt-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <CRMTabs />
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription>Latest client interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {RECENT_ACTIVITIES.map(activity => (
                        <div key={activity.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">{activity.client}</p>
                            <p className="text-sm text-muted-foreground">{activity.activity}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(activity.date)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Client Status</CardTitle>
                    <CardDescription>Active vs inactive clients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-full space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Active</span>
                            <span className="font-medium">
                              {CLIENTS.filter(c => c.status === "Active").length}/{CLIENTS.length}
                            </span>
                          </div>
                          <div className="h-2 rounded bg-muted">
                            <div 
                              className="h-2 rounded bg-primary" 
                              style={{ width: `${(CLIENTS.filter(c => c.status === "Active").length / CLIENTS.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-full space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Pending</span>
                            <span className="font-medium">
                              {CLIENTS.filter(c => c.status === "Pending").length}/{CLIENTS.length}
                            </span>
                          </div>
                          <div className="h-2 rounded bg-muted">
                            <div 
                              className="h-2 rounded bg-yellow-500" 
                              style={{ width: `${(CLIENTS.filter(c => c.status === "Pending").length / CLIENTS.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-full space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Inactive</span>
                            <span className="font-medium">
                              {CLIENTS.filter(c => c.status === "Inactive").length}/{CLIENTS.length}
                            </span>
                          </div>
                          <div className="h-2 rounded bg-muted">
                            <div 
                              className="h-2 rounded bg-gray-500" 
                              style={{ width: `${(CLIENTS.filter(c => c.status === "Inactive").length / CLIENTS.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="clients" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Client Directory</CardTitle>
                  <CardDescription>Manage and view client information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-6 border-b px-4 py-3 font-medium">
                      <div className="col-span-2">Name/Company</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-2">Contact</div>
                      <div className="col-span-1">Last Activity</div>
                    </div>
                    {CLIENTS.map(client => (
                      <div key={client.id} className="grid grid-cols-6 border-b px-4 py-3 hover:bg-muted/50">
                        <div className="col-span-2">
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.company}</p>
                        </div>
                        <div className="col-span-1">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold 
                            ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 
                             client.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                             'bg-gray-100 text-gray-800'}`}
                          >
                            {client.status}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm">{client.email}</p>
                          <p className="text-sm text-muted-foreground">{client.phone}</p>
                        </div>
                        <div className="col-span-1 text-sm text-muted-foreground">
                          {formatDate(client.lastContact)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <CrmAnalytics />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Task Management</CardTitle>
                  <CardDescription>Organize and track client-related tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Task management features coming soon</p>
                    <Button variant="outline" className="mt-4">Create New Task</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
