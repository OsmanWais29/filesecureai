import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncomeExpenseForm } from "@/components/activity/IncomeExpenseForm";
import { ActivityDashboard } from "@/components/activity/ActivityDashboard";
import { PredictiveAnalysis } from "@/components/activity/PredictiveAnalysis";
import { ClientSelector } from "@/components/activity/form/ClientSelector";
import { Client } from "@/components/activity/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { IncomeExpenseButton } from "@/components/activity/components/IncomeExpenseButton";
import { TrusteeCoPliotButton } from "@/components/activity/components/TrusteeCoPliot/TrusteeCoPliotButton"; 
import { UserRound } from "lucide-react";

// Valid UUID format mockup
const MOCK_CLIENTS = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479", // Valid UUID format
    name: "John Doe",
    status: "active" as const,
    last_activity: "2024-03-10",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440000", // Valid UUID format
    name: "Reginald Dickerson",
    status: "active" as const,
    last_activity: "2024-03-12",
  }
];

export const ActivityPage = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState("form");
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const location = useLocation();

  // Handle client selection for all tabs
  const handleClientSelect = (clientId: string) => {
    console.log("ActivityPage - Client selected:", clientId);
    
    // Find the client by ID
    const client = clients.find(c => c.id === clientId) || {
      id: clientId,
      name: "Unknown Client",
      status: "active" as const,
      last_activity: "2024-03-15",
    };
    
    setSelectedClient(client);
    toast.success(`Selected client: ${client.name}`);
  };

  // Handle new client creation from the IncomeExpenseButton
  const handleClientCreated = (clientId: string, clientName: string) => {
    const newClient: Client = {
      id: clientId,
      name: clientName,
      status: "active" as const,
      last_activity: new Date().toISOString().split('T')[0]
    };
    
    // Add the new client to the list
    setClients(prevClients => [...prevClients, newClient]);
    
    // Select the new client
    setSelectedClient(newClient);
  };

  // Handle tab switching from CreateFormButton
  useEffect(() => {
    if (location.state) {
      const { switchTab, clientId } = location.state as { switchTab?: string; clientId?: string };
      
      if (switchTab) {
        setActiveTab(switchTab);
      }
      
      if (clientId && !selectedClient) {
        handleClientSelect(clientId);
      }
    }
  }, [location.state, selectedClient]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Smart Income & Expense Management</h1>
        </div>
        
        {/* Centered Client Information Card */}
        <div className="flex justify-center">
          <Card className="border-none shadow-lg overflow-hidden max-w-3xl w-full">
            <div className="bg-gradient-to-r from-primary/20 to-primary/5 border-b">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <UserRound className="h-5 w-5 text-primary" />
                  <CardTitle>Client Information</CardTitle>
                </div>
                <CardDescription>Select a client to manage their financial data</CardDescription>
              </CardHeader>
            </div>

            <CardContent className="p-6 pt-6">
              <div className="space-y-6">
                {/* Large Client Selector */}
                <div className="bg-card border rounded-lg p-4 shadow-sm">
                  <label className="text-sm font-medium mb-2 block text-muted-foreground">
                    Select Client
                  </label>
                  <ClientSelector 
                    selectedClient={selectedClient}
                    onClientSelect={handleClientSelect}
                    availableClients={clients}
                  />
                </div>
                
                {/* Actions Buttons in Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium mb-2 text-muted-foreground">
                      Create Financial Form
                    </span>
                    <IncomeExpenseButton 
                      onClientCreated={handleClientCreated}
                      size="default"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm font-medium mb-2 text-muted-foreground">
                      AI Assistance
                    </span>
                    <TrusteeCoPliotButton 
                      clientId={selectedClient?.id}
                      size="default"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs 
          defaultValue="form" 
          className="space-y-4"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="form">Income & Expense Form</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="predictive">Predictive Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-4">
            <IncomeExpenseForm selectedClient={selectedClient} />
          </TabsContent>

          <TabsContent value="dashboard">
            <ActivityDashboard selectedClient={selectedClient} />
          </TabsContent>

          <TabsContent value="predictive">
            <PredictiveAnalysis selectedClient={selectedClient} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ActivityPage;
