
import React from 'react';
import { EnhancedTaskDashboard } from '@/components/TaskManagement/EnhancedTaskDashboard';

export const TaskManagementPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <EnhancedTaskDashboard />
    </div>
  );
};

export default TaskManagementPage;
