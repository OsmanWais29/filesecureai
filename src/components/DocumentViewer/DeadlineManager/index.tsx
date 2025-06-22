
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { Deadline } from '../types';
import { DeadlineManagerProps } from './types';
import { AddDeadlineForm } from './AddDeadlineForm';
import { DeadlineList } from './DeadlineList';

export const DeadlineManager: React.FC<DeadlineManagerProps> = ({ document, onDeadlineUpdated }) => {
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  // Check for approaching deadlines
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      document.deadlines?.forEach(deadline => {
        const dueDate = new Date(deadline.dueDate);
        const hoursDiff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursDiff <= 24 && hoursDiff > 23) {
          toast({
            title: "24 Hour Alert",
            description: `Alert: ${deadline.title} must be done in 24 hours`
          });
        } else if (hoursDiff <= 4 && hoursDiff > 3) {
          toast({
            title: "4 Hour Alert",
            description: `Alert: ${deadline.title} must be done in 4 hours`
          });
        }
      });
    };

    const interval = setInterval(checkDeadlines, 1000 * 60); // Check every minute
    return () => clearInterval(interval);
  }, [document.deadlines, toast]);

  const handleAddDeadline = async (newDeadline: Deadline) => {
    try {
      const currentDeadlines = document.deadlines || [];
      console.log('Current document state:', document);
      console.log('Adding new deadline:', newDeadline);

      const { error } = await supabase
        .from('documents')
        .update({
          deadlines: [...currentDeadlines, newDeadline]
        })
        .eq('id', document.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Deadline added successfully"
      });

      setIsAdding(false);
      onDeadlineUpdated();
    } catch (error: any) {
      console.error('Error adding deadline:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add deadline"
      });
    }
  };

  const removeDeadline = async (index: number) => {
    try {
      const currentDeadlines = [...(document.deadlines || [])];
      currentDeadlines.splice(index, 1);

      const { error } = await supabase
        .from('documents')
        .update({
          deadlines: currentDeadlines
        })
        .eq('id', document.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Deadline removed successfully"
      });

      onDeadlineUpdated();
    } catch (error: any) {
      console.error('Error removing deadline:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove deadline"
      });
    }
  };

  return (
    <div className="p-4 rounded-md bg-muted">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Deadlines</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="text-sm text-primary hover:underline flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Add</span>
        </button>
      </div>

      {isAdding && (
        <AddDeadlineForm
          onAdd={handleAddDeadline}
          onCancel={() => setIsAdding(false)}
        />
      )}

      <DeadlineList
        deadlines={document.deadlines || []}
        onRemove={removeDeadline}
      />
    </div>
  );
};
