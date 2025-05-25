
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ClientDashboard } from '@/components/crm/ClientDashboard';

const CRMPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto p-6 bg-background min-h-screen">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">CRM Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your clients, cases, and business operations
          </p>
        </div>
        <ClientDashboard />
      </div>
    </MainLayout>
  );
};

export default CRMPage;
