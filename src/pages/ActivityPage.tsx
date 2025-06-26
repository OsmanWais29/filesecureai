
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">Smart Income & Expense Management</h1>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Client Information Card */}
          <Card className="shadow-sm border-0 bg-white mb-8">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-gray-800">Client Information</CardTitle>
              <CardDescription className="text-gray-600">
                Select a client or create a new form
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <div className="flex items-center gap-4">
                {/* Client Selector - Takes up most of the space */}
                <div className="flex-1">
                  <ClientSelector 
                    selectedClient={selectedClient}
                    onClientSelect={handleClientSelect}
                    availableClients={clients}
                  />
                </div>
                
                {/* Create Button */}
                <div className="flex-shrink-0">
                  <IncomeExpenseButton 
                    onClientCreated={handleClientCreated}
                    size="default"
                    className="bg-teal-600 hover:bg-teal-700"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border-0">
            <Tabs 
              defaultValue="form" 
              className="w-full"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-3 w-full rounded-none bg-gray-100 p-1">
                <TabsTrigger 
                  value="form" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Income & Expense Form
                </TabsTrigger>
                <TabsTrigger 
                  value="dashboard"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="predictive"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Predictive Analysis
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="form" className="mt-0">
                  <IncomeExpenseForm selectedClient={selectedClient} />
                </TabsContent>

                <TabsContent value="dashboard" className="mt-0">
                  <ActivityDashboard selectedClient={selectedClient} />
                </TabsContent>

                <TabsContent value="predictive" className="mt-0">
                  <PredictiveAnalysis selectedClient={selectedClient} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ActivityPage;
