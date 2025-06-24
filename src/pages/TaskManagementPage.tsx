
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TaskManagement } from '@/components/tasks/TaskManagement';

const TaskManagementPage = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-1">Manage and track your tasks and workflows.</p>
        </div>
        <TaskManagement />
      </div>
    </MainLayout>
  );
};

export default TaskManagementPage;
