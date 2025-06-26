
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntelligentScheduling } from "../IntelligentScheduling";
import { ClientProfileView } from "../components/profile/ClientProfileView";
import { DocumentManagement } from "@/components/DocumentList/DocumentManagement";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { CRMDashboard } from "../dashboard/CRMDashboard";

export const CRMTabs = () => {
  return (
    <Tabs defaultValue="dashboard" className="space-y-4">
      <TabsList>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="client-profile">Client Profile</TabsTrigger>
        <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <CRMDashboard />
      </TabsContent>
      
      <TabsContent value="client-profile">
        <ClientProfileView />
      </TabsContent>
      
      <TabsContent value="scheduling">
        <IntelligentScheduling />
      </TabsContent>
      
      <TabsContent value="documents">
        <DocumentManagement />
      </TabsContent>
      
      <TabsContent value="analytics">
        <AnalyticsDashboard />
      </TabsContent>
    </Tabs>
  );
};
