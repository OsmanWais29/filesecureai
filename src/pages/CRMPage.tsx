
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
import { ClientList } from "@/components/crm/client/ClientList";
import { ClientFormDialog } from "@/components/crm/client/ClientFormDialog";
import { ClientData, useClientManagement } from "@/hooks/useClientManagement";
import { ClientView } from "@/components/crm/ClientView";
import { format } from "date-fns";

// Mock data for recent activities - we'll implement real activities later
const RECENT_ACTIVITIES = [
  { id: "act1", client: "John Doe", activity: "Document uploaded", date: "2025-05-18T09:30:00Z" },
  { id: "act2", client: "Jane Smith", activity: "Comment added", date: "2025-05-17T15:45:00Z" },
  { id: "act3", client: "Robert Johnson", activity: "Meeting scheduled", date: "2025-05-17T11:20:00Z" },
  { id: "act4", client: "John Doe", activity: "Task completed", date: "2025-05-16T13:10:00Z" }
];

// Format date to a readable string
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, 'MMM d, h:mm a');
};

export default function CRMPage() {
  const {
    clients,
    isLoading,
    stats,
    addClient,
    updateClient,
    deleteClient
  } = useClientManagement();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editClient, setEditClient] = useState<ClientData | null>(null);
  
  const handleAddClient = () => {
    setEditClient(null);
    setClientFormOpen(true);
  };
  
  const handleEditClient = (client: ClientData) => {
    setEditClient(client);
    setClientFormOpen(true);
  };
  
  const handleSaveClient = async (clientData: Partial<ClientData>) => {
    setIsSubmitting(true);
    
    try {
      if (editClient) {
        // Update existing client
        await updateClient(editClient.id, clientData);
      } else {
        // Add new client
        await addClient(clientData as Omit<ClientData, 'id' | 'created_at' | 'updated_at'>);
      }
      setClientFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteClient = async (client: ClientData) => {
    await deleteClient(client.id);
    if (selectedClient?.id === client.id) {
      setSelectedClient(null);
    }
  };
  
  const handleSelectClient = (client: ClientData) => {
    setSelectedClient(client);
  };

  return (
    <MainLayout>
      <div className="container py-6">
        <CRMHeader openClientDialog={handleAddClient} />
        
        <ClientStats stats={stats} isLoading={isLoading} />

        <div className="mt-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="clients" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Clients
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Analytics
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" /> Tasks
              </TabsTrigger>
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
                              {stats.active}/{stats.total}
                            </span>
                          </div>
                          <div className="h-2 rounded bg-muted">
                            <div 
                              className="h-2 rounded bg-primary" 
                              style={{ width: `${stats.total > 0 ? (stats.active / stats.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-full space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Pending</span>
                            <span className="font-medium">
                              {stats.pending}/{stats.total}
                            </span>
                          </div>
                          <div className="h-2 rounded bg-muted">
                            <div 
                              className="h-2 rounded bg-yellow-500" 
                              style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-full space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Inactive</span>
                            <span className="font-medium">
                              {stats.inactive}/{stats.total}
                            </span>
                          </div>
                          <div className="h-2 rounded bg-muted">
                            <div 
                              className="h-2 rounded bg-gray-500" 
                              style={{ width: `${stats.total > 0 ? (stats.inactive / stats.total) * 100 : 0}%` }}
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
              {selectedClient ? (
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedClient(null)}
                    className="mb-2"
                  >
                    ← Back to Client List
                  </Button>
                  <ClientView clientId={selectedClient.id} />
                </div>
              ) : (
                <ClientList
                  clients={clients}
                  isLoading={isLoading}
                  onEdit={handleEditClient}
                  onDelete={handleDeleteClient}
                  onAdd={handleAddClient}
                  onClientSelect={handleSelectClient}
                />
              )}
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
      
      <ClientFormDialog
        open={clientFormOpen}
        onOpenChange={setClientFormOpen}
        onSave={handleSaveClient}
        client={editClient || undefined}
        isSubmitting={isSubmitting}
        title={editClient ? "Edit Client" : "Add New Client"}
      />
    </MainLayout>
  );
}
