
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface EnhancedTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  category: string;
  severity: 'low' | 'medium' | 'high';
  estimated_duration?: number;
  actual_duration?: number;
  completion_percentage: number;
  ai_generated: boolean;
  risk_id?: string;
  form_number?: string;
  bia_section?: string;
  regulation?: string;
  solution?: string;
  compliance_deadline?: string;
  auto_assigned: boolean;
  task_template_id?: string;
  dependencies: string[];
  tags: string[];
  ai_confidence_score?: number;
  assigned_to?: string;
  document_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  form_number?: string;
  bia_section?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  estimated_duration?: number;
  template_steps: any[];
  compliance_requirements: any;
  deadline_rules: any;
}

export interface TaskStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  ai_generated: number;
  high_priority: number;
}

export function useEnhancedTaskManagement(documentId?: string) {
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    overdue: 0,
    ai_generated: 0,
    high_priority: 0
  });

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (documentId) {
        query = query.eq('document_id', documentId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const enhancedTasks: EnhancedTask[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        category: task.category || 'general',
        severity: task.severity || 'medium',
        estimated_duration: task.estimated_duration,
        actual_duration: task.actual_duration,
        completion_percentage: task.completion_percentage || 0,
        ai_generated: task.ai_generated || false,
        risk_id: task.risk_id,
        form_number: task.form_number,
        bia_section: task.bia_section,
        regulation: task.regulation,
        solution: task.solution,
        compliance_deadline: task.compliance_deadline,
        auto_assigned: task.auto_assigned || false,
        task_template_id: task.task_template_id,
        dependencies: task.dependencies || [],
        tags: task.tags || [],
        ai_confidence_score: task.ai_confidence_score,
        assigned_to: task.assigned_to,
        document_id: task.document_id,
        created_by: task.created_by,
        created_at: task.created_at,
        updated_at: task.updated_at,
        due_date: task.due_date || task.compliance_deadline
      }));

      setTasks(enhancedTasks);
      calculateStats(enhancedTasks);

    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching task templates:', error);
    }
  }, []);

  const calculateStats = (taskList: EnhancedTask[]) => {
    const now = new Date();
    const newStats: TaskStats = {
      total: taskList.length,
      pending: taskList.filter(t => t.status === 'pending').length,
      in_progress: taskList.filter(t => t.status === 'in_progress').length,
      completed: taskList.filter(t => t.status === 'completed').length,
      cancelled: taskList.filter(t => t.status === 'cancelled').length,
      overdue: taskList.filter(t => 
        t.due_date && new Date(t.due_date) < now && t.status !== 'completed'
      ).length,
      ai_generated: taskList.filter(t => t.ai_generated).length,
      high_priority: taskList.filter(t => t.priority === 'high').length
    };
    setStats(newStats);
  };

  const createTask = async (taskData: Partial<EnhancedTask>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority || 'medium',
          category: taskData.category || 'general',
          severity: taskData.severity || 'medium',
          estimated_duration: taskData.estimated_duration,
          form_number: taskData.form_number,
          bia_section: taskData.bia_section,
          regulation: taskData.regulation,
          solution: taskData.solution,
          compliance_deadline: taskData.compliance_deadline,
          dependencies: taskData.dependencies || [],
          tags: taskData.tags || [],
          assigned_to: taskData.assigned_to,
          document_id: taskData.document_id || documentId,
          created_by: taskData.created_by,
          due_date: taskData.due_date
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTasks();
      toast.success('Task created successfully');
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<EnhancedTask>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchTasks();
      toast.success('Task updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      return false;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTasks();
      toast.success('Task deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      return false;
    }
  };

  const generateTasksFromTemplate = async (templateId: string, context: any = {}) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const tasksToCreate = template.template_steps.map((step: any, index: number) => ({
        title: step.title,
        description: `${template.description} - Step ${index + 1}: ${step.title}`,
        priority: template.priority,
        category: template.category,
        estimated_duration: Math.ceil((template.estimated_duration || 60) / template.template_steps.length),
        form_number: template.form_number,
        bia_section: template.bia_section,
        task_template_id: template.id,
        document_id: documentId,
        ...context
      }));

      const createdTasks = [];
      for (const taskData of tasksToCreate) {
        const result = await createTask(taskData);
        if (result) createdTasks.push(result);
      }

      toast.success(`Create ${createdTasks.length} tasks from template`);
      return createdTasks;
    } catch (error) {
      console.error('Error generating tasks from template:', error);
      toast.error('Failed to generate tasks from template');
      throw error;
    }
  };

  const assignTask = async (taskId: string, assigneeId: string, notes?: string) => {
    try {
      // Update task assignment
      await updateTask(taskId, { assigned_to: assigneeId });

      // Create assignment record
      const { error } = await supabase
        .from('task_assignments')
        .insert({
          task_id: taskId,
          assigned_to: assigneeId,
          notes: notes || 'Manual assignment'
        });

      if (error) throw error;

      toast.success('Task assigned successfully');
      return true;
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.error('Failed to assign task');
      return false;
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchTemplates();
  }, [fetchTasks, fetchTemplates]);

  return {
    tasks,
    templates,
    stats,
    isLoading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    generateTasksFromTemplate,
    assignTask
  };
}
