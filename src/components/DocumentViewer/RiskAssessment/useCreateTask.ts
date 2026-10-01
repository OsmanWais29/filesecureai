
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Risk } from "./types";

import { sfaiFunctions } from "@/lib/sfaiFunctions";
export const useCreateTask = (documentId: string) => {
  const { toast } = useToast();

  const handleCreateTask = async (risk: Risk) => {
    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("User not authenticated");

      const dueDays = risk.severity === 'high' ? 2 : risk.severity === 'medium' ? 5 : 7;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + dueDays);

      // Insert the task
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: `Resolve ${risk.severity} risk: ${risk.type}`,
          description: `${risk.description}\n\nRequired Action: ${risk.requiredAction || 'N/A'}\nImpact: ${risk.impact || 'N/A'}`,
          severity: risk.severity,
          document_id: documentId,
          created_by: user.id,
          regulation: risk.regulation,
          solution: risk.solution,
          due_date: dueDate.toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Get document information for the notification
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('title')
        .eq('id', documentId)
        .single();

      if (docError) throw docError;

      // Create notification for the task
      await sfaiFunctions.invoke('handle-notifications', {
        body: {
          action: 'create',
          userId: user.id,
          notification: {
            title: 'Task Created from Risk Assessment',
            message: `Task for document "${document.title}" created: ${risk.type}`,
            type: 'info',
            priority: risk.severity === 'high' ? 'high' : 'normal',
            action_url: `/documents/${documentId}`,
            category: 'task',
            metadata: {
              documentId,
              riskType: risk.type,
              severity: risk.severity,
              taskId: taskData?.id
            }
          }
        }
      });

      // Add a second notification for task deadline
      await sfaiFunctions.invoke('handle-notifications', {
        body: {
          action: 'create',
          userId: user.id,
          notification: {
            title: 'Task Deadline Reminder',
            message: `Task "${risk.type}" is due in ${dueDays} days`,
            type: 'reminder',
            priority: risk.severity === 'high' ? 'high' : 'normal',
            action_url: `/documents/${documentId}`,
            category: 'reminder',
            metadata: {
              documentId,
              taskId: taskData?.id,
              dueDate: dueDate.toISOString(),
              remainingDays: dueDays
            }
          }
        }
      });

      return taskData;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create task"
      });
      return null;
    }
  };

  return { handleCreateTask };
};
