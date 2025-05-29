
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AccessControlDashboard } from '@/components/settings/access-control/AccessControlDashboard';

const SettingsPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <AccessControlDashboard />
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
