
import React, { useState } from "react";
import { TaskList } from "./TaskList";
import { TaskFormDialog } from "./TaskFormDialog";
import { useTaskManagement, TaskData } from "@/hooks/useTaskManagement";
import { toast } from "sonner";

export const TasksContainer = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask
  } = useTaskManagement();

  const handleAdd = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEdit = (task: TaskData) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDelete = async (task: TaskData) => {
    try {
      await deleteTask(task.id);
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleStatusChange = async (taskId: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    try {
      await updateTask(taskId, { status });
      toast.success("Task status updated");
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const handleFormSubmit = async (data: Partial<TaskData>) => {
    setIsSubmitting(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
        toast.success("Task updated successfully");
      } else {
        await addTask(data as Omit<TaskData, 'id' | 'created_at' | 'updated_at'>);
        toast.success("Task created successfully");
      }
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      toast.error("Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
      
      <TaskFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingTask(null);
          }
        }}
        onSave={handleFormSubmit}
        task={editingTask || undefined}
        isSubmitting={isSubmitting}
        title={editingTask ? "Edit Task" : "Create Task"}
      />
    </>
  );
};
