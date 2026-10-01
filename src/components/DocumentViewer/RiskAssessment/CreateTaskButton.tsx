
import { ClipboardList } from "lucide-react";
import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Risk } from "./types";
import { useCreateTask } from "./useCreateTask";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

import { sfaiFunctions } from "@/lib/sfaiFunctions";
interface CreateTaskButtonProps {
  documentId: string;
  title?: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  risk?: Risk;
}

export const CreateTaskButton = ({ 
  documentId, 
  title, 
  description, 
  priority,
  risk 
}: CreateTaskButtonProps) => {
  const { handleCreateTask } = useCreateTask(documentId);
  const { toast } = useToast();
  
  const createNotification = async (taskTitle: string, severity: string) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;
      
      // Call the handle-notifications edge function
      const { error } = await sfaiFunctions.invoke('handle-notifications', {
        body: {
          action: 'create',
          userId: user.data.user.id,
          notification: {
            title: 'New Task Created',
            message: `Task "${taskTitle}" has been created with ${severity} priority`,
            type: 'info',
            category: 'task',
            priority: severity === 'high' ? 'high' : 'normal',
            action_url: `/documents/${documentId}`,
            metadata: {
              documentId,
              taskType: severity,
              created: new Date().toISOString()
            }
          }
        }
      });

      if (error) {
        console.error('Failed to create notification:', error);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };
  
  const handleClick = async () => {
    if (risk) {
      await handleCreateTask(risk);
      await createNotification(risk.type, risk.severity);
      
      toast({
        title: "Task Created",
        description: `Created task for risk: ${risk.type}`,
      });
    } else if (title && description) {
      // Create a custom risk object from the provided props
      const customRisk: Risk = {
        type: title,
        description: description,
        severity: priority || 'medium',
        regulation: '',
        impact: '',
        requiredAction: '',
        solution: ''
      };
      await handleCreateTask(customRisk);
      await createNotification(title, priority || 'medium');
      
      toast({
        title: "Task Created",
        description: `Created task: ${title}`,
      });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="ml-4 shrink-0">
          <ClipboardList className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium">Create Task for Risk</h4>
          <p className="text-sm text-muted-foreground">
            This will create a task with the following due date based on severity:
          </p>
          <ul className="text-sm space-y-1">
            <li>High: 2 days</li>
            <li>Medium: 5 days</li>
            <li>Low: 7 days</li>
          </ul>
          <Button className="w-full mt-2" onClick={handleClick}>
            Confirm Task Creation
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
