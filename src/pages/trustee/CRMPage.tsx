
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ClientDashboard } from '@/components/crm/ClientDashboard';

const CRMPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <ClientDashboard />
      </div>
    </MainLayout>
  );
};

export default CRMPage;
