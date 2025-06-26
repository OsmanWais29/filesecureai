
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncomeExpenseForm } from "@/components/activity/IncomeExpenseForm";
import { ActivityDashboard } from "@/components/activity/ActivityDashboard";
import { PredictiveAnalysis } from "@/components/activity/PredictiveAnalysis";
import { ClientSelector } from "@/components/activity/form/ClientSelector";
import { Client } from "@/components/activity/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { IncomeExpenseButton } from "@/components/activity/components/IncomeExpenseButton";
import { TrusteeCoPliotButton } from "@/components/activity/components/TrusteeCoPliot/TrusteeCoPliotButton"; 
import { UserRound, Plus, FileText, TrendingUp } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Smart Income & Expense Management
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Streamline your financial data collection with AI-powered forms and predictive analysis
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Client Selection Section */}
          <div className="mb-12">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <UserRound className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Client Selection</CardTitle>
                <CardDescription className="text-gray-600">
                  Choose an existing client or create a new income & expense form
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-8 pb-8">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  {/* Client Selector */}
                  <div className="w-full sm:w-80">
                    <ClientSelector 
                      selectedClient={selectedClient}
                      onClientSelect={handleClientSelect}
                      availableClients={clients}
                    />
                  </div>
                  
                  {/* Create New Form Button */}
                  <div className="flex-shrink-0">
                    <IncomeExpenseButton 
                      onClientCreated={handleClientCreated}
                      size="lg"
                      className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg font-medium"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Cards Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Form Management Card */}
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg text-gray-800">Form Management</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Create and manage income & expense forms
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab("form")}
                >
                  View Forms
                </Button>
              </CardContent>
            </Card>

            {/* Analytics Card */}
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg text-gray-800">Analytics Dashboard</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  View financial insights and trends
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab("dashboard")}
                >
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Predictive Analysis Card */}
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg text-gray-800">Predictive Analysis</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  AI-powered financial forecasting
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab("predictive")}
                >
                  View Predictions
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <div className="bg-white rounded-xl shadow-lg border-0">
            <Tabs 
              defaultValue="form" 
              className="w-full"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-3 w-full rounded-t-xl bg-gray-50 p-2">
                <TabsTrigger 
                  value="form" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-3"
                >
                  Income & Expense Forms
                </TabsTrigger>
                <TabsTrigger 
                  value="dashboard"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-3"
                >
                  Financial Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="predictive"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-3"
                >
                  Predictive Analysis
                </TabsTrigger>
              </TabsList>

              <div className="p-8">
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
