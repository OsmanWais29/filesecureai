
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';

const WorkflowPage = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-600 mt-1">Manage your automated workflows and processes.</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Workflow management features coming soon...</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default WorkflowPage;
