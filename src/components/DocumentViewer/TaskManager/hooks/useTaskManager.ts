
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Task } from '../../types';
import { safeObjectCast } from '@/utils/typeSafetyUtils';

export const useTaskManager = (documentId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('document_id', documentId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Process data and ensure each task has required properties
        const typedTasks = (data || []).map(task => ({
          id: String(task.id || ''),
          title: String(task.title || ''),
          description: task.description ? String(task.description) : undefined,
          status: task.status ? String(task.status) : 'pending',
          severity: task.severity ? String(task.severity) : undefined,
          assigned_to: task.assigned_to ? String(task.assigned_to) : undefined,
          document_id: task.document_id ? String(task.document_id) : undefined,
          due_date: task.due_date ? String(task.due_date) : undefined,
          created_at: task.created_at ? String(task.created_at) : undefined,
          updated_at: task.updated_at ? String(task.updated_at) : undefined,
        }));
        
        setTasks(typedTasks as Task[]);
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (documentId) {
      fetchTasks();
    }
  }, [documentId]);
  
  const createTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...taskData, document_id: documentId })
        .select()
        .single();
        
      if (error) throw error;
      
      // Convert the returned data to a Task
      const newTask = {
        id: String(data.id),
        title: String(data.title),
        description: data.description ? String(data.description) : undefined,
        status: data.status ? String(data.status) : 'pending',
        severity: data.severity ? String(data.severity) : undefined,
        assigned_to: data.assigned_to ? String(data.assigned_to) : undefined,
        document_id: documentId,
        due_date: data.due_date ? String(data.due_date) : undefined,
        created_at: data.created_at ? String(data.created_at) : undefined,
        updated_at: data.updated_at ? String(data.updated_at) : undefined,
      };
      
      setTasks(prevTasks => [newTask, ...prevTasks]);
      return newTask;
    } catch (err: any) {
      console.error('Error creating task:', err);
      throw err;
    }
  };
  
  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, ...updates } : task
        )
      );
      
      return true;
    } catch (err: any) {
      console.error('Error updating task:', err);
      throw err;
    }
  };
  
  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };
  
  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask
  };
};
