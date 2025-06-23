
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Brain, CheckCircle, AlertTriangle, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface AITaskGeneratorProps {
  documentId: string;
  documentTitle: string;
  formNumber?: string;
  riskAssessments?: any[];
  onTasksGenerated?: (tasks: any[]) => void;
}

interface GeneratedTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimated_duration: number;
  ai_confidence_score: number;
  compliance_deadline?: string;
  bia_section?: string;
}

export const AITaskGenerator: React.FC<AITaskGeneratorProps> = ({
  documentId,
  documentTitle,
  formNumber,
  riskAssessments = [],
  onTasksGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [workflowSuggestions, setWorkflowSuggestions] = useState<any[]>([]);
  const [complianceAlerts, setComplianceAlerts] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  const generateTasks = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      toast.info('Starting AI task generation...', {
        description: 'Analyzing document and risks to create intelligent tasks'
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke('ai-task-generator', {
        body: {
          documentId,
          riskAssessments,
          formNumber,
          userContext: {
            userId: 'current-user', // This would come from auth context
            role: 'trustee',
            expertise: ['bankruptcy_law', 'form_analysis']
          }
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        throw new Error(error.message || 'Failed to generate tasks');
      }

      if (data?.success) {
        setGeneratedTasks(data.generated_tasks || []);
        setWorkflowSuggestions(data.workflow_suggestions || []);
        setComplianceAlerts(data.compliance_alerts || []);
        
        toast.success('AI tasks generated successfully!', {
          description: `Created ${data.task_count} intelligent tasks based on document analysis`
        });

        onTasksGenerated?.(data.generated_tasks);
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }

    } catch (error) {
      console.error('Task generation error:', error);
      toast.error('Failed to generate tasks', {
        description: error instanceof Error ? error.message : 'Please try again later'
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Generator Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            AI Task Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Generate intelligent tasks for <strong>{documentTitle}</strong>
              </p>
              {formNumber && (
                <Badge variant="outline" className="mt-1">
                  {formNumber}
                </Badge>
              )}
            </div>
            <Button
              onClick={generateTasks}
              disabled={isGenerating}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Tasks'}
            </Button>
          </div>
          
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground text-center">
                AI analyzing document and generating intelligent tasks...
              </p>
            </div>
          )}
          
          {riskAssessments.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Processing {riskAssessments.length} risk assessment(s) for task generation
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Alerts */}
      {complianceAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Compliance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {complianceAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-orange-50 rounded border-l-4 border-orange-400"
                >
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    {alert.deadline && (
                      <p className="text-xs text-muted-foreground">
                        Deadline: {new Date(alert.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge variant={alert.severity === 'high' ? 'destructive' : 'outline'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Tasks */}
      {generatedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Generated Tasks ({generatedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generatedTasks.map((task, index) => (
                <div
                  key={task.id || index}
                  className="border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">
                        {task.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {task.estimated_duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(task.estimated_duration)}
                      </div>
                    )}
                    
                    {task.ai_confidence_score && (
                      <div className="flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        {Math.round(task.ai_confidence_score * 100)}% confidence
                      </div>
                    )}
                    
                    {task.bia_section && (
                      <Badge variant="outline" className="text-xs">
                        {task.bia_section}
                      </Badge>
                    )}
                  </div>

                  {task.compliance_deadline && (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                      <strong>Compliance Deadline:</strong> {new Date(task.compliance_deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Suggestions */}
      {workflowSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Workflow Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflowSuggestions.map((workflow, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <h4 className="font-medium">{workflow.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {workflow.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Est. {formatDuration(workflow.estimated_total_time)}
                    <span>•</span>
                    {workflow.task_sequence?.length || 0} tasks
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
