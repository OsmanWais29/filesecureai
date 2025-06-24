
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';

const ClientPage = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-1">Manage your clients and their information.</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Client management features coming soon...</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default ClientPage;
