
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { FileUpload } from "@/components/FileUpload";
import { useAuthState } from "@/hooks/useAuthState";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Clock, FileCheck, FileText, FileUp, FolderCheck, Bell, ShieldCheck, CircleAlert } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const ClientDashboard = () => {
  const { user } = useAuthState();
  
  // Mock data for demonstration - would come from API in real implementation
  const estateStatus = {
    status: "Active",
    fileNumber: "31-5432100",
    dateOfFiling: "April 12, 2025",
    nextAction: "Monthly Payment Due",
    nextActionDate: "June 15, 2025",
    completionProgress: 42,
    documents: {
      total: 12,
      completed: 7,
      pending: 5
    },
    tasks: [
      { id: "1", title: "Sign Form 47", due: "2025-05-15", priority: "high", status: "pending" },
      { id: "2", title: "Upload bank statements", due: "2025-05-12", priority: "medium", status: "pending" },
      { id: "3", title: "Review proposal terms", due: "2025-05-10", priority: "medium", status: "completed" }
    ],
    upcomingAppointments: [
      { id: "1", title: "Monthly Review", date: "2025-05-20", time: "10:30 AM" },
      { id: "2", title: "Financial Assessment", date: "2025-06-05", time: "2:00 PM" }
    ],
    recentDocuments: [
      { id: "1", title: "Form 47 - Consumer Proposal", date: "2025-04-12", status: "complete" },
      { id: "2", title: "Income Verification", date: "2025-04-10", status: "pending" },
      { id: "3", title: "Bank Statements - March", date: "2025-04-08", status: "complete" }
    ],
    notifications: [
      { id: "1", title: "Document approved", message: "Your Form 47 was approved", time: "1 hour ago", type: "success" },
      { id: "2", title: "Upcoming deadline", message: "Bank statements due in 3 days", time: "5 hours ago", type: "warning" }
    ]
  };
  
  const handleUploadComplete = async (documentId: string) => {
    try {
      if (!user) return;
      
      // Link the document to this client's folder if needed
      console.log(`Document ${documentId} uploaded successfully`);
      
      // You could update document metadata or link to client profile here
    } catch (error) {
      console.error("Error handling uploaded document:", error);
    }
  };

  return (
    <div className="space-y-5">
      {/* Welcome Message */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">Here's an overview of your consumer proposal. Your next payment is due on June 15, 2025.</p>
      </div>

      {/* Status Overview Card */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                Estate File #{estateStatus.fileNumber}
                <StatusBadge status={estateStatus.status} />
              </CardTitle>
              <CardDescription className="text-base">
                Filed on {estateStatus.dateOfFiling}
              </CardDescription>
            </div>
            <Button variant="outline">View Details</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                <p className="font-medium text-blue-700 dark:text-blue-400">Next Action</p>
              </div>
              <p className="text-sm">{estateStatus.nextAction}</p>
              <p className="text-xs text-muted-foreground mt-1">Due {estateStatus.nextActionDate}</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FileCheck className="h-4 w-4 text-green-700 dark:text-green-400" />
                <p className="font-medium text-green-700 dark:text-green-400">Documents</p>
              </div>
              <p className="text-sm">{estateStatus.documents.completed} of {estateStatus.documents.total} Complete</p>
              <div className="mt-2">
                <Progress value={estateStatus.documents.completed / estateStatus.documents.total * 100} className="h-1.5" />
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FolderCheck className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                <p className="font-medium text-purple-700 dark:text-purple-400">Overall Progress</p>
              </div>
              <p className="text-sm">{estateStatus.completionProgress}% Complete</p>
              <div className="mt-2">
                <Progress value={estateStatus.completionProgress} className="h-1.5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {estateStatus.notifications.map((notification) => (
            <div key={notification.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
              <div className={`mt-1 p-2 rounded-full ${notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                {notification.type === 'success' ? <ShieldCheck className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
              </div>
              <div>
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="ml-auto">View All Notifications</Button>
        </CardFooter>
      </Card>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>
        
        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
              <CardDescription>Tasks that require your attention</CardDescription>
            </CardHeader>
            <CardContent>
              {estateStatus.tasks.filter(task => task.status === "pending").map(task => (
                <div key={task.id} className="border-b py-3 last:border-0 last:pb-0 first:pt-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">Due {task.due}</p>
                    </div>
                    <Button variant="outline" size="sm">Complete</Button>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">{estateStatus.tasks.filter(task => task.status === "pending").length} tasks pending</p>
              <Button variant="ghost" size="sm">View All Tasks</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
              <CardDescription>Recently completed requirements</CardDescription>
            </CardHeader>
            <CardContent>
              {estateStatus.tasks.filter(task => task.status === "completed").map(task => (
                <div key={task.id} className="border-b py-3 last:border-0 last:pb-0 first:pt-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium line-through text-muted-foreground">{task.title}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <CardDescription>Upload required documents for your case</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload onUploadComplete={handleUploadComplete} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {estateStatus.recentDocuments.map(doc => (
                <div key={doc.id} className="flex items-center p-2 border-b last:border-0 hover:bg-muted/50 rounded-md">
                  <div className="mr-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">Uploaded {doc.date}</p>
                  </div>
                  <StatusBadge status={doc.status === "complete" ? "Complete" : "Incomplete"} />
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="ml-auto">View All Documents</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {estateStatus.upcomingAppointments.length > 0 ? (
                estateStatus.upcomingAppointments.map(appointment => (
                  <div key={appointment.id} className="flex items-center p-3 border rounded-md mb-2">
                    <div className="mr-3 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{appointment.title}</p>
                      <p className="text-sm text-muted-foreground">{appointment.date} at {appointment.time}</p>
                    </div>
                    <Button variant="outline" size="sm">Reschedule</Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No upcoming appointments scheduled.</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Schedule New Appointment</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Meeting Preparation</CardTitle>
              <CardDescription>Things to prepare for your upcoming meetings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium mb-2">For your Monthly Review on May 20th</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li className="text-sm">Recent bank statements (last 3 months)</li>
                  <li className="text-sm">Pay stubs or income verification</li>
                  <li className="text-sm">List of any new expenses or income changes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
