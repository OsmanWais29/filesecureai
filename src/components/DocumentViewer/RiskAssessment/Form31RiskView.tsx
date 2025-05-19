import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useTaskManager } from '../TaskManager/hooks/useTaskManager';
import { Task } from '../TaskManager/types';
import { TaskList } from '../TaskManager/components/TaskList';

interface Form31RiskViewProps {
  risks: any[];
}

export const Form31RiskView: React.FC<Form31RiskViewProps> = ({ risks }) => {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('medium');
  const { toast } = useToast();
  const { createTask, tasks, isLoading, error } = useTaskManager();

  const toggleCreateTask = useCallback(() => {
    setIsCreateTaskOpen((prev) => !prev);
  }, []);

  const handleCreateTask = useCallback(async () => {
    if (!taskTitle.trim()) {
      toast({
        title: "Error",
        description: "Task title cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
        title: taskTitle,
        description: taskDescription,
        severity: selectedSeverity,
        document_id: 'form31', // Replace with actual document ID
      };

      await createTask(newTask);

      toast({
        title: "Success",
        description: "Task created successfully.",
      });

      setTaskTitle('');
      setTaskDescription('');
      setSelectedSeverity('medium');
      setIsCreateTaskOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to create task: ${err.message}`,
        variant: "destructive",
      });
    }
  }, [createTask, taskTitle, taskDescription, selectedSeverity, toast]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {risks.map((risk, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{risk.type}</CardTitle>
            <CardDescription>
              <Badge
                variant={
                  risk.severity === "high"
                    ? "destructive"
                    : risk.severity === "medium"
                    ? "secondary"
                    : "outline"
                }
              >
                {risk.severity}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{risk.description}</p>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button
              variant="default"  // Changed from "outline" to "default"
              onClick={toggleCreateTask}
            >
              Create Task
            </Button>
            <Checkbox id={`risk-${index}`} />
          </CardFooter>
        </Card>
      ))}

      {isCreateTaskOpen && (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
            <CardDescription>Add details for this task.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                type="text"
                id="task-title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-severity">Severity</Label>
              <select
                id="task-severity"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="button" onClick={handleCreateTask}>
              Create Task
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Task List</CardTitle>
          <CardDescription>All tasks associated with this document.</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskList documentId="form31" />
        </CardContent>
      </Card>
    </div>
  );
};
