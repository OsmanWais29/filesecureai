
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/client-portal/StatusBadge";
import { useState } from "react";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileCheck, 
  Filter, 
  Search, 
  AlertCircle 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export const ClientTasksPage = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - in a real implementation, this would come from your database
  const tasks = [
    { 
      id: "1", 
      title: "Sign Form 47", 
      description: "Electronic signature required for your Consumer Proposal",
      due: "2025-05-15", 
      priority: "high", 
      status: "pending",
      assignedBy: "Jane Smith (Trustee)"
    },
    { 
      id: "2", 
      title: "Upload April bank statements", 
      description: "Please provide statements for all accounts",
      due: "2025-05-12", 
      priority: "medium", 
      status: "pending",
      assignedBy: "System"
    },
    { 
      id: "3", 
      title: "Review proposal terms", 
      description: "Review and approve the terms of your consumer proposal",
      due: "2025-05-10", 
      priority: "medium", 
      status: "completed",
      assignedBy: "Jane Smith (Trustee)",
      completedDate: "2025-05-09"
    },
    { 
      id: "4", 
      title: "Complete budget worksheet", 
      description: "Fill out the monthly income and expense worksheet",
      due: "2025-05-08", 
      priority: "high", 
      status: "completed",
      assignedBy: "System",
      completedDate: "2025-05-07"
    },
    { 
      id: "5", 
      title: "Submit Form 65", 
      description: "Monthly income and expense statement needs to be submitted",
      due: "2025-05-20", 
      priority: "medium", 
      status: "pending",
      assignedBy: "Jane Smith (Trustee)"
    }
  ];

  const pendingTasks = tasks.filter(task => task.status === "pending");
  const completedTasks = tasks.filter(task => task.status === "completed");
  
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === "all" || 
                         (filter === "pending" && task.status === "pending") || 
                         (filter === "completed" && task.status === "completed") ||
                         (filter === "high" && task.priority === "high");
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const completionPercentage = (completedTasks.length / tasks.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tasks & Requirements</h1>
          <p className="text-muted-foreground">Track and complete your required actions</p>
        </div>
      </div>
      
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle>Progress Summary</CardTitle>
          <CardDescription>Your task completion progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{completedTasks.length} of {tasks.length} tasks completed</p>
                <p className="text-muted-foreground text-sm">
                  {pendingTasks.length > 0 
                    ? `${pendingTasks.length} pending tasks requiring your attention` 
                    : "All tasks completed! Great job!"}
                </p>
              </div>
              <div className="text-xl font-semibold text-blue-600">
                {Math.round(completionPercentage)}%
              </div>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
          
          {pendingTasks.length > 0 && (
            <div className="mt-4 flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
              <Clock className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Next deadline: {new Date(pendingTasks.sort((a, b) => 
                  new Date(a.due).getTime() - new Date(b.due).getTime())[0].due).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter tasks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending Tasks</SelectItem>
            <SelectItem value="completed">Completed Tasks</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending Tasks</TabsTrigger>
          <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pending Tasks</CardTitle>
              <CardDescription>
                Tasks that require your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingTasks.length > 0 ? (
                <div className="space-y-4">
                  {pendingTasks.map(task => (
                    <div key={task.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            task.priority === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {task.priority === "high" ? 
                              <AlertCircle className="h-5 w-5" /> : 
                              <Clock className="h-5 w-5" />
                            }
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{task.title}</h3>
                            <p className="text-muted-foreground">{task.description}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-sm">
                              <div className="flex items-center text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-1" />
                                Due: {new Date(task.due).toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-muted-foreground">
                                <FileCheck className="h-4 w-4 mr-1" />
                                Assigned by: {task.assignedBy}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button className="ml-2" size="sm">
                          Complete Task
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-xl font-medium">All caught up!</h3>
                  <p className="text-muted-foreground text-center mt-1">
                    You have no pending tasks at the moment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Completed Tasks</CardTitle>
              <CardDescription>
                Tasks you have already completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedTasks.length > 0 ? (
                <div className="space-y-3">
                  {completedTasks.map(task => (
                    <div key={task.id} className="border rounded-md p-4 bg-muted/30">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{task.title}</h3>
                            <span className="text-sm text-muted-foreground">
                              Completed on {new Date(task.completedDate!).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-muted-foreground">No completed tasks yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientTasksPage;
