
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, Clock, FileCheck, FileText, ShieldCheck, CircleAlert, Bell } from "lucide-react";

export const ClientDashboard = () => {
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

  return (
    <div className="p-4 md:p-6 w-full max-w-full">
      {/* Welcome Message */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-muted-foreground text-lg">Here's an overview of your consumer proposal. Your next payment is due on June 15, 2025.</p>
      </div>

      {/* Status Overview Card */}
      <Card className="border-l-4 border-l-green-500 shadow-sm mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                Estate File #{estateStatus.fileNumber}
                <StatusBadge status={estateStatus.status} className="ml-2" />
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Filed on {estateStatus.dateOfFiling}
              </CardDescription>
            </div>
            <Button variant="outline" size="lg">View Details</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                <p className="font-medium text-lg text-blue-700 dark:text-blue-400">Next Action</p>
              </div>
              <p className="text-lg font-medium">{estateStatus.nextAction}</p>
              <p className="text-muted-foreground mt-1">Due {estateStatus.nextActionDate}</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <FileCheck className="h-5 w-5 text-green-700 dark:text-green-400" />
                <p className="font-medium text-lg text-green-700 dark:text-green-400">Documents</p>
              </div>
              <p className="text-lg font-medium">{estateStatus.documents.completed} of {estateStatus.documents.total} Complete</p>
              <div className="mt-3">
                <Progress value={(estateStatus.documents.completed / estateStatus.documents.total) * 100} className="h-2" />
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <FileCheck className="h-5 w-5 text-purple-700 dark:text-purple-400" />
                <p className="font-medium text-lg text-purple-700 dark:text-purple-400">Overall Progress</p>
              </div>
              <p className="text-lg font-medium">{estateStatus.completionProgress}% Complete</p>
              <div className="mt-3">
                <Progress value={estateStatus.completionProgress} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - spans 2/3 on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Notifications */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {estateStatus.notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className={`mt-1 p-2 rounded-full ${notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    {notification.type === 'success' ? <ShieldCheck className="h-5 w-5" /> : <CircleAlert className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-lg">{notification.title}</p>
                    <p className="text-muted-foreground">{notification.message}</p>
                    <p className="text-sm text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="ml-auto">View All Notifications</Button>
            </CardFooter>
          </Card>
        
          {/* Tasks Tab */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
              <CardDescription>Tasks that require your attention</CardDescription>
            </CardHeader>
            <CardContent>
              {estateStatus.tasks.filter(task => task.status === "pending").map(task => (
                <div key={task.id} className="border-b py-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-lg">{task.title}</p>
                      <p className="text-muted-foreground">Due {task.due}</p>
                    </div>
                    <Button>Complete</Button>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-muted-foreground">{estateStatus.tasks.filter(task => task.status === "pending").length} tasks pending</p>
              <Button variant="ghost">View All Tasks</Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right column - spans 1/3 on large screens */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {estateStatus.upcomingAppointments.map(appointment => (
                <div key={appointment.id} className="flex flex-col p-4 border rounded-md mb-3 last:mb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="font-medium">{appointment.title}</p>
                  </div>
                  <p className="text-muted-foreground text-sm ml-11">{appointment.date} at {appointment.time}</p>
                  <Button variant="outline" size="sm" className="mt-3 ml-auto">Reschedule</Button>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button>Schedule New Appointment</Button>
            </CardFooter>
          </Card>
          
          {/* Recent Documents */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {estateStatus.recentDocuments.map(doc => (
                <div key={doc.id} className="flex items-center p-3 border-b last:border-0 hover:bg-muted/50 rounded-md">
                  <div className="mr-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-muted-foreground">Uploaded {doc.date}</p>
                  </div>
                  <StatusBadge status={doc.status === "complete" ? "Complete" : "Incomplete"} />
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="ml-auto">View All Documents</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
