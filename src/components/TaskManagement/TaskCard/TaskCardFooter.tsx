
import React from 'react';
import { Brain } from 'lucide-react';
import { EnhancedTask } from '@/hooks/useEnhancedTaskManagement';

interface TaskCardFooterProps {
  task: EnhancedTask;
}

export const TaskCardFooter: React.FC<TaskCardFooterProps> = ({ task }) => {
  if (!task.ai_confidence_score) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Brain className="h-3 w-3" />
      <span>AI Confidence: {Math.round(task.ai_confidence_score * 100)}%</span>
    </div>
  );
};
