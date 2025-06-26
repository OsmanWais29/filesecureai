
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientView } from "@/components/crm/ClientView";
import { MeetingsContainer } from "@/components/crm/meetings/MeetingsContainer";
import { Users, BarChart3, Activity, FileText, Calendar } from "lucide-react";

export const CRMTabs = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Client Profile</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Meetings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Client Profile</h2>
            <p className="text-muted-foreground">Manage client information and view detailed profiles.</p>
            <ClientView />
          </div>
        </TabsContent>
        
        <TabsContent value="dashboard" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Client Dashboard</h2>
            <p className="text-muted-foreground">Overview of client metrics and performance indicators.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">Total Clients</h3>
                <p className="text-2xl font-bold text-blue-600">124</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">Active Cases</h3>
                <p className="text-2xl font-bold text-green-600">89</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">At Risk</h3>
                <p className="text-2xl font-bold text-red-600">12</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">Completed</h3>
                <p className="text-2xl font-bold text-gray-600">23</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Client Activity</h2>
            <p className="text-muted-foreground">Track client interactions and activity timeline.</p>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Recent Activity</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>John Doe submitted contact form - 2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Meeting completed with Jane Smith - 1 day ago</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Document uploaded by Mike Johnson - 3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Client Documents</h2>
            <p className="text-muted-foreground">Manage and organize client documents and files.</p>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Document Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Forms</h4>
                  <p className="text-sm text-muted-foreground">Legal forms and applications</p>
                  <p className="text-lg font-bold mt-2">45</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Financial</h4>
                  <p className="text-sm text-muted-foreground">Financial statements and reports</p>
                  <p className="text-lg font-bold mt-2">32</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Correspondence</h4>
                  <p className="text-sm text-muted-foreground">Letters and communications</p>
                  <p className="text-lg font-bold mt-2">18</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Meetings Management</h2>
            <p className="text-muted-foreground">Schedule, manage, and track all your client meetings.</p>
            <MeetingsContainer />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
