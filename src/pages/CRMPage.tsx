
import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrmAnalytics } from "@/components/analytics/crm/CrmAnalytics";
import { Calendar, Clock, ListCheck, User, Users } from "lucide-react";
import { ClientStats } from "@/components/crm/page/ClientStats";
import { CRMHeader } from "@/components/crm/page/CRMHeader";
import { CRMTabs } from "@/components/crm/page/CRMTabs";
import { ClientList } from "@/components/crm/client/ClientList";
import { ClientFormDialog } from "@/components/crm/client/ClientFormDialog";
import { ClientData, useClientManagement } from "@/hooks/useClientManagement";
import { ClientView } from "@/components/crm/ClientView";
import { format } from "date-fns";
import { TaskData, useTaskManagement } from "@/hooks/useTaskManagement";
import { TaskFormDialog } from "@/components/crm/tasks/TaskFormDialog";
import { TaskList } from "@/components/crm/tasks/TaskList";
import { MeetingData, useMeetingManagement } from "@/hooks/useMeetingManagement";
import { MeetingFormDialog } from "@/components/crm/meetings/MeetingFormDialog";
import { MeetingsList } from "@/components/crm/meetings/MeetingsList";

export default function CRMPage() {
  const {
    clients,
    isLoading: isLoadingClients,
    stats: clientStats,
    addClient,
    updateClient,
    deleteClient
  } = useClientManagement();
  
  const {
    tasks,
    isLoading: isLoadingTasks,
    stats: taskStats,
    addTask,
    updateTask,
    deleteTask
  } = useTaskManagement();
  
  const {
    meetings,
    isLoading: isLoadingMeetings,
    stats: meetingStats,
    addMeeting,
    updateMeeting,
    deleteMeeting
  } = useMeetingManagement();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [meetingFormOpen, setMeetingFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editClient, setEditClient] = useState<ClientData | null>(null);
  const [editTask, setEditTask] = useState<TaskData | null>(null);
  const [editMeeting, setEditMeeting] = useState<MeetingData | null>(null);
  
  // Client Management Functions
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

  // Task Management Functions
  const handleAddTask = () => {
    setEditTask(null);
    setTaskFormOpen(true);
  };
  
  const handleEditTask = (task: TaskData) => {
    setEditTask(task);
    setTaskFormOpen(true);
  };
  
  const handleSaveTask = async (taskData: Partial<TaskData>) => {
    setIsSubmitting(true);
    
    try {
      if (editTask) {
        // Update existing task
        await updateTask(editTask.id, taskData);
      } else {
        // Add new task
        await addTask(taskData as Omit<TaskData, 'id' | 'created_at' | 'updated_at'>);
      }
      setTaskFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteTask = async (task: TaskData) => {
    await deleteTask(task.id);
  };
  
  const handleTaskStatusChange = async (taskId: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    await updateTask(taskId, { status });
  };

  // Meeting Management Functions
  const handleAddMeeting = () => {
    setEditMeeting(null);
    setMeetingFormOpen(true);
  };
  
  const handleEditMeeting = (meeting: MeetingData) => {
    setEditMeeting(meeting);
    setMeetingFormOpen(true);
  };
  
  const handleSaveMeeting = async (meetingData: Partial<MeetingData>) => {
    setIsSubmitting(true);
    
    try {
      if (editMeeting) {
        // Update existing meeting
        await updateMeeting(editMeeting.id, meetingData);
      } else {
        // Add new meeting
        await addMeeting(meetingData as Omit<MeetingData, 'id' | 'created_at' | 'updated_at'>);
      }
      setMeetingFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteMeeting = async (meeting: MeetingData) => {
    await deleteMeeting(meeting.id);
  };
  
  const handleMeetingStatusChange = async (meetingId: string, status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled') => {
    await updateMeeting(meetingId, { status });
  };

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, h:mm a');
  };

  // Get recent activities from tasks and meetings
  const getRecentActivities = () => {
    const taskActivities = tasks.slice(0, 5).map(task => ({
      id: `task-${task.id}`,
      client: "Task",
      activity: task.title,
      date: task.created_at || new Date().toISOString()
    }));
    
    const meetingActivities = meetings.slice(0, 5).map(meeting => ({
      id: `meeting-${meeting.id}`,
      client: "Meeting",
      activity: meeting.title,
      date: meeting.created_at || new Date().toISOString()
    }));
    
    return [...taskActivities, ...meetingActivities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const recentActivities = getRecentActivities();

  return (
    <MainLayout>
      <div className="container py-6">
        <CRMHeader openClientDialog={handleAddClient} />
        
        <ClientStats stats={clientStats} isLoading={isLoadingClients} />

        <div className="mt-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="clients" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Clients
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <ListCheck className="h-4 w-4" /> Tasks
              </TabsTrigger>
              <TabsTrigger value="meetings" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Meetings
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Analytics
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
                      {recentActivities.length > 0 ? (
                        recentActivities.map(activity => (
                          <div key={activity.id} className="flex items-center justify-between border-b pb-2">
                            <div>
                              <p className="font-medium">{activity.client}</p>
                              <p className="text-sm text-muted-foreground">{activity.activity}</p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(activity.date)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <p>No recent activities</p>
                        </div>
                      )}
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
                              {clientStats.active}/{clientStats.total}
                            </span>
                          </div>
                          <div className="h-2 rounded bg-muted">
                            <div 
                              className="h-2 rounded bg-primary" 
                              style={{ width: `${clientStats.total > 0 ? (clientStats.active / clientStats.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-full space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Pending</span>
                            <span className="font-medium">
                              {clientStats.pending}/{clientStats.total}
                            </span>
                          </div>
                          <div className="h-2 rounded bg-muted">
                            <div 
                              className="h-2 rounded bg-yellow-500" 
                              style={{ width: `${clientStats.total > 0 ? (clientStats.pending / clientStats.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-full space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Inactive</span>
                            <span className="font-medium">
                              {clientStats.inactive}/{clientStats.total}
                            </span>
                          </div>
                          <div className="h-2 rounded bg-muted">
                            <div 
                              className="h-2 rounded bg-gray-500" 
                              style={{ width: `${clientStats.total > 0 ? (clientStats.inactive / clientStats.total) * 100 : 0}%` }}
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
                  isLoading={isLoadingClients}
                  onEdit={handleEditClient}
                  onDelete={handleDeleteClient}
                  onAdd={handleAddClient}
                  onClientSelect={handleSelectClient}
                />
              )}
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <TaskList
                tasks={tasks}
                isLoading={isLoadingTasks}
                onAdd={handleAddTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleTaskStatusChange}
              />
            </TabsContent>

            <TabsContent value="meetings" className="space-y-4">
              <MeetingsList
                meetings={meetings}
                isLoading={isLoadingMeetings}
                onAdd={handleAddMeeting}
                onEdit={handleEditMeeting}
                onDelete={handleDeleteMeeting}
                onStatusChange={handleMeetingStatusChange}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <CrmAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Dialogs */}
      <ClientFormDialog
        open={clientFormOpen}
        onOpenChange={setClientFormOpen}
        onSave={handleSaveClient}
        client={editClient || undefined}
        isSubmitting={isSubmitting}
        title={editClient ? "Edit Client" : "Add New Client"}
      />
      
      <TaskFormDialog
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        onSave={handleSaveTask}
        task={editTask || undefined}
        isSubmitting={isSubmitting}
        title={editTask ? "Edit Task" : "Add New Task"}
      />
      
      <MeetingFormDialog
        open={meetingFormOpen}
        onOpenChange={setMeetingFormOpen}
        onSave={handleSaveMeeting}
        meeting={editMeeting || undefined}
        isSubmitting={isSubmitting}
        title={editMeeting ? "Edit Meeting" : "Schedule New Meeting"}
      />
    </MainLayout>
  );
}
