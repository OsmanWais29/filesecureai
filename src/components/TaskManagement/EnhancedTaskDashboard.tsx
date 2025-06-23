
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  Brain, 
  Calendar,
  Search,
  Filter,
  Plus,
  Zap
} from 'lucide-react';
import { useEnhancedTaskManagement } from '@/hooks/useEnhancedTaskManagement';
import { TaskCard } from './TaskCard';
import { TaskCreationModal } from './TaskCreationModal';
import { WorkflowTemplates } from './WorkflowTemplates';
import { TaskAssignmentPanel } from './TaskAssignmentPanel';
import { useToast } from '@/hooks/use-toast';

export const EnhancedTaskDashboard: React.FC = () => {
  const {
    tasks,
    templates,
    stats,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    generateTasksFromTemplate,
    assignTask
  } = useEnhancedTaskManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const { toast } = useToast();

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleTaskUpdate = async (taskId: string, updates: any) => {
    try {
      await updateTask(taskId, updates);
      toast({
        title: "Task updated successfully",
        description: "The task has been updated with the new information."
      });
    } catch (error) {
      toast({
        title: "Failed to update task",
        description: "There was an error updating the task.",
        variant: "destructive"
      });
    }
  };

  const handleTaskCreate = async (taskData: any) => {
    try {
      await createTask(taskData);
      setShowCreateModal(false);
      toast({
        title: "Task created successfully",
        description: "The new task has been added to your dashboard."
      });
    } catch (error) {
      toast({
        title: "Failed to create task",
        description: "There was an error creating the task.",
        variant: "destructive"
      });
    }
  };

  const handleTemplateGenerate = async (templateId: string) => {
    try {
      await generateTasksFromTemplate(templateId);
      toast({
        title: "Tasks generated from template",
        description: "Multiple tasks have been created based on the selected template."
      });
    } catch (error) {
      toast({
        title: "Failed to generate tasks",
        description: "There was an error generating tasks from the template.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Task Management</h1>
          <p className="text-muted-foreground">AI-powered task management with BIA compliance workflows</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
          <Button variant="outline" className="gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.ai_generated}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleTaskUpdate}
                onDelete={deleteTask}
                onAssign={assignTask}
              />
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                      ? 'Try adjusting your filters or search criteria.'
                      : 'Create your first task to get started with AI-powered task management.'}
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    Create New Task
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <WorkflowTemplates
            templates={templates}
            onGenerateFromTemplate={handleTemplateGenerate}
          />
        </TabsContent>

        <TabsContent value="assignments">
          <TaskAssignmentPanel
            tasks={tasks}
            onAssignTask={assignTask}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Completion Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analytics coming soon...</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>AI Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">AI metrics coming soon...</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Task Creation Modal */}
      <TaskCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleTaskCreate}
        templates={templates}
      />
    </div>
  );
};
