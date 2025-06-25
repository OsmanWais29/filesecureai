
import React, { useState } from "react";
import { TaskList } from "./TaskList";
import { TaskFormDialog } from "./TaskFormDialog";
import { useTaskManagement, TaskData } from "@/hooks/useTaskManagement";
import { toast } from "sonner";

export const TasksContainer = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);

  const {
    tasks,
    isLoading,
    createTask,
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
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
        toast.success("Task updated successfully");
      } else {
        await createTask(data);
        toast.success("Task created successfully");
      }
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      toast.error("Failed to save task");
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
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        task={editingTask}
      />
    </>
  );
};
