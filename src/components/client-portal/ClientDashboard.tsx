
import { useAuthState } from "@/hooks/useAuthState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, FileTextIcon, CheckSquare, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const ClientDashboard = () => {
  const { user } = useAuthState();
  const navigate = useNavigate();
  
  // Get client name from user metadata or fallback to email
  const clientName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Client";

  const quickAccessItems = [
    {
      title: "My Documents",
      description: "Access and upload your documents",
      icon: FileTextIcon,
      path: "/client-portal/documents"
    },
    {
      title: "Tasks",
      description: "View and complete required tasks",
      icon: CheckSquare,
      path: "/client-portal/tasks"
    },
    {
      title: "Appointments",
      description: "Schedule and manage appointments",
      icon: CalendarIcon,
      path: "/client-portal/appointments"
    },
    {
      title: "Support",
      description: "Get help with any questions",
      icon: MessageCircle,
      path: "/client-portal/support"
    }
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Welcome, {clientName}</h1>
          <p className="text-muted-foreground">
            Access your documents, tasks, and appointments from your secure client portal.
          </p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickAccessItems.map((item) => (
              <Card key={item.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-primary"
                    onClick={() => navigate(item.path)}
                  >
                    Access {item.title}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Case Status</CardTitle>
              <CardDescription>Current status of your case</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="font-medium">Active - Proposal Approved</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Next Important Date</p>
                  <p className="text-sm text-muted-foreground">June 15, 2025 - Monthly Payment Due</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Case Progress</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 dark:bg-gray-700">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">45% Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {[
                  { title: "Document uploaded", date: "May 2, 2025", status: "Income Statement" },
                  { title: "Task completed", date: "April 29, 2025", status: "Monthly Reporting" },
                  { title: "Appointment scheduled", date: "April 25, 2025", status: "Review Meeting" }
                ].map((activity, index) => (
                  <li key={index} className="px-4 py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.status}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.date}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
