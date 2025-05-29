
import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Clock, AlertCircle, Calendar, FileText } from "lucide-react";

interface ClientTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedDate: string;
  category: 'document' | 'signature' | 'meeting' | 'review';
}

export const ClientTasks = () => {
  const { user } = useAuthState();
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    // Mock data for demonstration
    setTimeout(() => {
      setTasks([
        {
          id: "1",
          title: "Sign Income Statement",
          description: "Please review and sign your updated income statement document.",
          status: "pending",
          priority: "high",
          dueDate: "2024-02-01",
          assignedDate: "2024-01-15",
          category: "signature"
        },
        {
          id: "2",
          title: "Upload Bank Statements",
          description: "Upload your most recent 3 months of bank statements.",
          status: "in-progress",
          priority: "medium",
          dueDate: "2024-01-30",
          assignedDate: "2024-01-10",
          category: "document"
        },
        {
          id: "3",
          title: "Review Consumer Proposal",
          description: "Review the draft consumer proposal and provide feedback.",
          status: "completed",
          priority: "high",
          dueDate: "2024-01-20",
          assignedDate: "2024-01-05",
          category: "review"
        },
        {
          id: "4",
          title: "Schedule Creditor Meeting",
          description: "Confirm your availability for the creditor meeting.",
          status: "overdue",
          priority: "high",
          dueDate: "2024-01-18",
          assignedDate: "2024-01-08",
          category: "meeting"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'document': return FileText;
      case 'signature': return CheckSquare;
      case 'meeting': return Calendar;
      case 'review': return AlertCircle;
      default: return CheckSquare;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'in-progress': return Clock;
      case 'completed': return CheckSquare;
      case 'overdue': return AlertCircle;
      default: return Clock;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending' || task.status === 'in-progress' || task.status === 'overdue';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-white">
              <CardHeader className="h-20 bg-gray-100 rounded"></CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
              <p className="text-gray-600 mt-2">
                Track and complete your assigned tasks
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
                className={filter === 'all' ? 'bg-blue-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}
              >
                All Tasks
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                size="sm"
                className={filter === 'pending' ? 'bg-blue-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}
              >
                Pending
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilter('completed')}
                size="sm"
                className={filter === 'completed' ? 'bg-blue-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}
              >
                Completed
              </Button>
            </div>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.filter(t => t.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.filter(t => t.status === 'overdue').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.filter(t => t.status === 'completed').length}
                  </p>
                </div>
                <CheckSquare className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Card className="bg-white border shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckSquare className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-medium mb-2 text-gray-900">No tasks found</h3>
                <p className="text-gray-600">
                  {filter === 'all' 
                    ? "You don't have any tasks assigned yet." 
                    : `No ${filter} tasks to display.`}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const CategoryIcon = getCategoryIcon(task.category);
              const StatusIcon = getStatusIcon(task.status);
              
              return (
                <Card key={task.id} className="bg-white border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CategoryIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-gray-900">{task.title}</CardTitle>
                          <CardDescription className="text-gray-600">
                            Due: {formatDate(task.dueDate)} • Assigned: {formatDate(task.assignedDate)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getStatusColor(task.status)} font-medium`}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                        <Badge className={`${getPriorityColor(task.priority)} font-medium`}>
                          {task.priority} priority
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{task.description}</p>
                    
                    {isOverdue(task.dueDate, task.status) && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-800 font-medium">This task is overdue</span>
                      </div>
                    )}
                    
                    {task.status !== 'completed' && (
                      <div className="flex gap-3">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <StatusIcon className="h-4 w-4 mr-2" />
                          {task.status === 'pending' ? 'Start Task' : 'Continue'}
                        </Button>
                        {task.category === 'signature' && (
                          <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                            <FileText className="h-4 w-4 mr-2" />
                            View Document
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientTasks;
