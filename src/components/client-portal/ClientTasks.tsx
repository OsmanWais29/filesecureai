
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckSquare,
  Clock,
  AlertCircle,
  Plus,
  Calendar
} from "lucide-react";

const tasks = [
  {
    id: 1,
    title: "Submit Monthly Budget Report",
    description: "Complete and submit your monthly income and expense report",
    dueDate: "2024-01-22",
    priority: "high",
    status: "pending",
    category: "Financial"
  },
  {
    id: 2,
    title: "Update Contact Information",
    description: "Verify and update your current contact details",
    dueDate: "2024-01-25",
    priority: "medium",
    status: "pending",
    category: "Administrative"
  },
  {
    id: 3,
    title: "Review Financial Summary",
    description: "Review the quarterly financial summary document",
    dueDate: "2024-02-01",
    priority: "low",
    status: "pending",
    category: "Review"
  }
];

const completedTasks = [
  {
    id: 4,
    title: "Submit Initial Documentation",
    description: "Provide all required initial case documentation",
    dueDate: "2024-01-10",
    priority: "high",
    status: "completed",
    category: "Documentation",
    completedDate: "2024-01-08"
  },
  {
    id: 5,
    title: "Attend Orientation Meeting",
    description: "Complete the client orientation session",
    dueDate: "2024-01-05",
    priority: "high",
    status: "completed",
    category: "Meeting",
    completedDate: "2024-01-05"
  }
];

export const ClientTasks = () => {
  const [checkedTasks, setCheckedTasks] = useState<number[]>([]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4" />;
      case "medium":
        return <Clock className="h-4 w-4" />;
      case "low":
        return <CheckSquare className="h-4 w-4" />;
      default:
        return <CheckSquare className="h-4 w-4" />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `Due in ${diffDays} days`;
  };

  const TaskCard = ({ task, isCompleted = false }: any) => (
    <Card className={`hover:shadow-md transition-shadow ${isCompleted ? 'opacity-75' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {!isCompleted && (
              <Checkbox
                checked={checkedTasks.includes(task.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setCheckedTasks([...checkedTasks, task.id]);
                  } else {
                    setCheckedTasks(checkedTasks.filter(id => id !== task.id));
                  }
                }}
                className="mt-1"
              />
            )}
            <div className="flex-1">
              <CardTitle className={`text-lg ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {task.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getPriorityColor(task.priority)} className="flex items-center gap-1">
              {getPriorityIcon(task.priority)}
              {task.priority}
            </Badge>
            <Badge variant="outline">{task.category}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {isCompleted ? 
                `Completed on ${task.completedDate}` : 
                getDaysUntilDue(task.dueDate)
              }
            </span>
          </div>
          {!isCompleted && (
            <Button size="sm" variant="outline">
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Track your assigned tasks and deadlines</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request Task Extension
        </Button>
      </div>

      {/* Task Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-bold text-red-600">{tasks.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due This Week</p>
                <p className="text-2xl font-bold text-orange-600">
                  {tasks.filter(task => {
                    const due = new Date(task.dueDate);
                    const weekFromNow = new Date();
                    weekFromNow.setDate(weekFromNow.getDate() + 7);
                    return due <= weekFromNow;
                  }).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Tasks</TabsTrigger>
          <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {checkedTasks.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-800">
                    {checkedTasks.length} task(s) marked as complete
                  </span>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Submit Completion
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="grid gap-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
          
          {tasks.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending tasks</h3>
                <p className="text-gray-600">All caught up! Check back later for new tasks.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} isCompleted={true} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
