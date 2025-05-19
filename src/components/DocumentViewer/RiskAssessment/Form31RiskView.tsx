
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Shield, FileText, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Task } from '../TaskManager/types';
import TaskList from '../TaskManager/components/TaskList';

interface Form31RiskViewProps {
  risks: any[];
  documentId: string;
  isLoading?: boolean;
}

export const Form31RiskView: React.FC<Form31RiskViewProps> = ({ risks, documentId, isLoading }) => {
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  
  // This is a mock implementation as we don't have the full TaskManager context
  // In a real implementation, we'd use the full TaskManager hook 
  const createTask = (task: Task) => {
    setLocalTasks((prev) => [...prev, task]);
  };

  // Filter and sort risks
  const highRisks = risks.filter(risk => risk.severity === 'high');
  const mediumRisks = risks.filter(risk => risk.severity === 'medium');
  const lowRisks = risks.filter(risk => risk.severity === 'low');
  
  // Combined and sorted risks
  const sortedRisks = [...highRisks, ...mediumRisks, ...lowRisks];

  const renderRiskBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>
      case 'medium':
        return <Badge variant="default">Medium</Badge>
      case 'low':
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              Form 31 Risk Assessment
            </CardTitle>
            <Select defaultValue="all">
              <SelectTrigger className="w-[130px] h-8">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="high">High Risks</SelectItem>
                <SelectItem value="medium">Medium Risks</SelectItem>
                <SelectItem value="low">Low Risks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription>
            Risk analysis for Proof of Claim (Form 31)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : sortedRisks.length > 0 ? (
            <div className="space-y-3">
              {sortedRisks.map((risk, index) => (
                <div key={index} className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        {risk.severity === 'high' && <AlertTriangle className="h-4 w-4 text-destructive mr-2" />}
                        <h4 className="font-medium">{risk.title || risk.type || 'Risk Issue'}</h4>
                        <div className="ml-2">{renderRiskBadge(risk.severity)}</div>
                      </div>
                      <p className="text-sm text-muted-foreground">{risk.description}</p>
                      
                      {risk.solution && (
                        <Alert className="mt-2 py-2">
                          <p className="text-xs">
                            <span className="font-semibold">Solution: </span>
                            {risk.solution}
                          </p>
                        </Alert>
                      )}

                      {risk.regulation && (
                        <div className="mt-2 text-xs flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          <span className="text-muted-foreground">{risk.regulation}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => createTask({
                        id: `task-${Date.now()}`,
                        title: risk.title || risk.type || 'Fix Risk Issue',
                        description: risk.description,
                        severity: risk.severity,
                        document_id: documentId,
                        solution: risk.solution,
                        status: 'pending'
                      })}
                    >
                      Create Task
                    </Button>
                  </div>
                  
                  {index < sortedRisks.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No risks found for this document
            </div>
          )}
        </CardContent>
      </Card>
      
      {localTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Related Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList tasks={localTasks} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
