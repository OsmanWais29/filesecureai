
import { useState, useEffect } from "react";
import { useClientInsights } from "./hooks/useClientInsights";
import { ClientProfilePanel } from "./components/profile/ClientProfilePanel";
import { ClientActivityPanel } from "./components/profile/ClientActivityPanel";
import { ClientIntelligencePanel } from "./components/profile/ClientIntelligencePanel";
import { ClientGridView } from "./components/ClientGridView";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, LayoutGrid, User, Activity, FileText, Video } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CRMTabs } from "./page/CRMTabs";
import { MeetingsTabs } from "@/components/meetings/MeetingsTabs";

interface ClientDashboardProps {
  clientId?: string;
  clientName?: string;
}

export const ClientDashboard = ({ clientId: propClientId, clientName: propClientName }: ClientDashboardProps) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(propClientId || "1");
  const [selectedClientName, setSelectedClientName] = useState<string>(propClientName || "John Doe");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"detail" | "grid">("detail");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("profile");
  const { insightData, isLoading, error } = useClientInsights(selectedClientId);

  const clients = [
    { id: "1", name: "John Doe", company: "Acme Inc.", status: "active", lastActivity: "2023-06-10", riskScore: 85 },
    { id: "2", name: "Jane Smith", company: "Tech Solutions", status: "inactive", lastActivity: "2023-05-20", riskScore: 45 },
    { id: "3", name: "Robert Johnson", company: "Global Services", status: "at_risk", lastActivity: "2023-06-15", riskScore: 62 }
  ];

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClientName(client.name);
    }
    setView("detail");
  };

  const handleExitGridView = () => {
    setView("detail");
  };

  useEffect(() => {
    if (propClientId) {
      setSelectedClientId(propClientId);
    }
    if (propClientName) {
      setSelectedClientName(propClientName);
    }
  }, [propClientId, propClientName]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-[450px]" />
          <Skeleton className="h-[450px]" />
          <Skeleton className="h-[450px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!insightData) {
    return (
      <div className="space-y-4">
        <div className="text-center p-6">
          <h3 className="text-lg font-medium">No Client Selected</h3>
          <p className="text-muted-foreground">Please select a client to view their dashboard.</p>
        </div>
      </div>
    );
  }

  if (view === "grid") {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Client Management</h1>
          
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ClientGridView 
          clients={clients} 
          onSelectClient={handleClientChange}
          searchQuery={searchQuery}
          filterStatus={filterStatus}
          onExitGridView={handleExitGridView}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full justify-start mb-6 bg-muted/30">
          <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="h-4 w-4 mr-2" />
            Client Profile
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="meetings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Video className="h-4 w-4 mr-2" />
            Meetings Hub
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{selectedClientName}'s Profile</h1>
              <Badge 
                variant={insightData.riskLevel === "high" ? "destructive" : insightData.riskLevel === "medium" ? "outline" : "secondary"}
                className="text-xs"
              >
                {insightData.riskLevel === "high" ? "At Risk" : insightData.riskLevel === "medium" ? "Needs Attention" : "Healthy"}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedClientId} onValueChange={handleClientChange}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => setView("grid")}>
                View All Clients
              </Button>
            </div>
          </div>

          <ResizablePanelGroup direction="horizontal" className="min-h-[500px] rounded-lg border">
            <ResizablePanel defaultSize={25} minSize={20}>
              <ClientProfilePanel insights={insightData} clientName={selectedClientName} />
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={45} minSize={30}>
              <ClientActivityPanel insights={insightData} />
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={30} minSize={20}>
              <ClientIntelligencePanel insights={insightData} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-0">
          <CRMTabs />
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Client Activity Timeline</h2>
            <p className="text-muted-foreground">View all interactions, communications, and events related to {selectedClientName}.</p>
            
            <div className="bg-card p-6 rounded-lg border">
              <div className="space-y-4">
                {insightData.recentActivities && insightData.recentActivities.map((activity, index) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.timestamp || "").toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Client Documents</h2>
            </div>
            <p className="text-muted-foreground">Manage all documents related to {selectedClientName}.</p>
            
            <div className="bg-card p-6 rounded-lg border">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Missing Documents</h3>
                  <Button size="sm" variant="outline">Upload Document</Button>
                </div>
                
                <div className="grid gap-2">
                  {insightData.missingDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <p>{doc}</p>
                      <Button size="sm" variant="ghost">Request</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="meetings" className="mt-0">
          <MeetingsTabs />
        </TabsContent>
      </Tabs>
    </div>
  );
};
