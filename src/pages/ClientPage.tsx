
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ClientManagement } from '@/components/clients/ClientManagement';

const ClientPage = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-1">Manage your clients and their information.</p>
        </div>
        <ClientManagement />
      </div>
    </MainLayout>
  );
};

export default ClientPage;
