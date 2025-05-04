
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Clock, CheckCircle, AlertCircle, Calendar, Upload, ArrowRight } from "lucide-react";
import { format } from "date-fns";

// Task types
type TaskStatus = "pending" | "in-progress" | "completed" | "overdue";
type TaskPriority = "high" | "medium" | "low";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  category: string;
  assignedBy: string;
}

export const ClientTasks = () => {
  const [activeTab, setActiveTab] = useState("pending");

  // Sample tasks data
  const tasks: Task[] = [
    {
      id: "1",
      title: "Complete Income and Expense Form",
      description: "Fill out and submit your monthly income and expenses.",
      status: "pending",
      priority: "high",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      category: "Forms",
      assignedBy: "John Smith (Trustee)"
    },
    {
      id: "2",
      title: "Budget Consultation Call",
      description: "Attend a virtual meeting with your trustee to discuss budget planning.",
      status: "pending",
      priority: "medium",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      category: "Meetings",
      assignedBy: "John Smith (Trustee)"
    },
    {
      id: "3",
      title: "Review Proposal Terms",
      description: "Review and confirm you understand the proposal terms and conditions.",
      status: "in-progress",
      priority: "high",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      category: "Legal",
      assignedBy: "John Smith (Trustee)"
    },
    {
      id: "4",
      title: "Submit Proof of Income",
      description: "Upload your recent pay stubs or income statements.",
      status: "overdue",
      priority: "high",
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      category: "Documents",
      assignedBy: "John Smith (Trustee)"
    },
    {
      id: "5",
      title: "Complete Financial Counselling Session 1",
      description: "Complete your first mandatory financial counselling session.",
      status: "completed",
      priority: "medium",
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      category: "Counselling",
      assignedBy: "John Smith (Trustee)"
    }
  ];

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter(task => {
    if (activeTab === "all") return true;
    return task.status === activeTab;
  });

  // Count tasks by status
  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(task => task.status === "pending").length,
    "in-progress": tasks.filter(task => task.status === "in-progress").length,
    completed: tasks.filter(task => task.status === "completed").length,
    overdue: tasks.filter(task => task.status === "overdue").length,
  };

  // Function to render task status badge
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return null;
    }
  };

  // Function to render task priority indicator
  const getPriorityIndicator = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return <div className="flex items-center text-red-500 text-xs font-medium"><AlertCircle className="h-3 w-3 mr-1" />High Priority</div>;
      case "medium":
        return <div className="flex items-center text-yellow-500 text-xs font-medium"><AlertCircle className="h-3 w-3 mr-1" />Medium Priority</div>;
      case "low":
        return <div className="flex items-center text-green-500 text-xs font-medium"><AlertCircle className="h-3 w-3 mr-1" />Low Priority</div>;
      default:
        return null;
    }
  };

  // Function to handle task completion
  const handleTaskComplete = (taskId: string) => {
    // In a real implementation, this would update the task status in the database
    console.log(`Task ${taskId} marked as completed`);
  };

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks & Requirements</h1>
      </div>
      
      <p className="text-muted-foreground">
        Track your mandatory tasks, deadlines, and requirements for your case. Completing these items on time is essential to your successful outcome.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All Tasks
            <span className="flex items-center justify-center h-5 w-5 bg-muted rounded-full text-xs">
              {taskCounts.all}
            </span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pending
            <span className="flex items-center justify-center h-5 w-5 bg-muted rounded-full text-xs">
              {taskCounts.pending}
            </span>
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex items-center gap-2">
            In Progress
            <span className="flex items-center justify-center h-5 w-5 bg-muted rounded-full text-xs">
              {taskCounts["in-progress"]}
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            Completed
            <span className="flex items-center justify-center h-5 w-5 bg-muted rounded-full text-xs">
              {taskCounts.completed}
            </span>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center gap-2">
            Overdue
            <span className="flex items-center justify-center h-5 w-5 bg-muted rounded-full text-xs text-red-500 font-bold">
              {taskCounts.overdue}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className={task.status === "overdue" ? "border-red-300" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      {getStatusBadge(task.status)}
                    </div>
                    <CardDescription className="mt-1">{task.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className={`${task.status === "overdue" ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                          Due {format(new Date(task.dueDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <FileCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">{task.category}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {getPriorityIndicator(task.priority)}
                        <span className="text-xs text-muted-foreground">Assigned by: {task.assignedBy}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2">
                    {task.status !== "completed" ? (
                      <div className="flex w-full gap-2">
                        {task.category === "Documents" && (
                          <Button size="sm" variant="outline" className="flex-1">
                            <Upload className="h-4 w-4 mr-1" /> Upload
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant={task.status === "overdue" ? "destructive" : "default"} 
                          className="flex-1"
                          onClick={() => handleTaskComplete(task.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {task.status === "overdue" ? "Mark Complete (Overdue)" : "Mark Complete"}
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full">
                        <Button size="sm" variant="ghost" className="text-green-600 w-full">
                          <CheckCircle className="h-4 w-4 mr-1" /> Completed
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No {activeTab} tasks</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {activeTab === "completed" 
                  ? "You haven't completed any tasks yet. As you finish tasks, they'll appear here."
                  : activeTab === "overdue"
                    ? "Great job! You don't have any overdue tasks."
                    : "You don't have any tasks in this category right now."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border p-4 mt-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-full">
            <AlertCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-medium">Need help with your tasks?</h3>
            <p className="text-sm text-muted-foreground">
              Contact your trustee for guidance or to discuss any concerns about your requirements.
            </p>
          </div>
          <Button variant="outline" className="ml-auto">
            Contact Trustee <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
