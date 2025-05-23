
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { withFreshToken } from "@/utils/jwt/tokenManager";

export interface TaskData {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  client_id?: string;
  assigned_to?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Type guard to ensure proper TaskData type
const ensureTaskDataType = (data: unknown): TaskData => {
  const task = data as Record<string, any>;
  return {
    id: String(task.id || ''),
    title: String(task.title || 'Untitled Task'),
    description: task.description ? String(task.description) : undefined,
    status: ['pending', 'in_progress', 'completed', 'cancelled'].includes(task.status) ? task.status : 'pending',
    priority: ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium',
    due_date: task.due_date ? String(task.due_date) : undefined,
    client_id: task.client_id ? String(task.client_id) : undefined,
    assigned_to: task.assigned_to ? String(task.assigned_to) : undefined,
    created_by: task.created_by ? String(task.created_by) : undefined,
    created_at: task.created_at ? String(task.created_at) : undefined,
    updated_at: task.updated_at ? String(task.updated_at) : undefined
  };
};

export function useTaskManagement() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0
  });
  const { toast } = useToast();

  const fetchTasks = async () => {
    setIsLoading(true);
    
    try {
      await withFreshToken(async () => {
        const { data, error } = await supabase
          .from('client_tasks')
          .select('*')
          .order('due_date', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const typedTasks = data.map(ensureTaskDataType);
          setTasks(typedTasks);
          
          // Calculate stats
          const newStats = {
            total: typedTasks.length,
            pending: typedTasks.filter(task => task.status === 'pending').length,
            in_progress: typedTasks.filter(task => task.status === 'in_progress').length,
            completed: typedTasks.filter(task => task.status === 'completed').length,
            cancelled: typedTasks.filter(task => task.status === 'cancelled').length
          };
          
          setStats(newStats);
        }
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Failed to load tasks",
        description: "There was a problem fetching task data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (taskData: Omit<TaskData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('client_tasks')
        .insert({
          ...taskData,
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newTask = ensureTaskDataType(data[0]);
        setTasks(prevTasks => [newTask, ...prevTasks]);
        fetchTasks(); // Refresh all tasks to update stats
        
        toast({
          title: "Task added",
          description: `${taskData.title} has been added successfully.`,
        });
        
        return newTask;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Failed to add task",
        description: "There was a problem adding the task.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateTask = async (id: string, taskData: Partial<TaskData>) => {
    try {
      const { error } = await supabase
        .from('client_tasks')
        .update({
          ...taskData,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, ...taskData } : task
        )
      );
      
      // If we're updating the status, refresh all tasks to update stats
      if ('status' in taskData) {
        fetchTasks();
      }
      
      toast({
        title: "Task updated",
        description: "Task information has been updated.",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Failed to update task",
        description: "There was a problem updating the task.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('client_tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      fetchTasks(); // Refresh all tasks to update stats
      
      toast({
        title: "Task deleted",
        description: "The task has been removed.",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Failed to delete task",
        description: "There was a problem deleting the task.",
        variant: "destructive"
      });
      return false;
    }
  };

  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id) || null;
  };

  const getTasksByClientId = (clientId: string) => {
    return tasks.filter(task => task.client_id === clientId);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    isLoading,
    stats,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
    getTasksByClientId
  };
}
