
import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";

interface ClientTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  created_at: string;
}

export const ClientTasks = () => {
  const { user } = useAuthState();
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('client_tasks')
        .select('*')
        .eq('client_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const markTaskComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('client_tasks')
        .update({ status: 'completed' })
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: 'completed' } : task
      ));
      
      toast.success('Task marked as complete');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="h-20 bg-muted"></CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground">
          Track your assigned tasks and action items
        </p>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No tasks assigned</h3>
              <p className="text-muted-foreground">
                You're all caught up! New tasks will appear here when assigned.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge variant="outline">
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>{task.description}</CardDescription>
                
                {task.due_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </div>
                )}
                
                {task.status !== 'completed' && (
                  <Button 
                    onClick={() => markTaskComplete(task.id)}
                    size="sm"
                    className="w-full"
                  >
                    Mark as Complete
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
