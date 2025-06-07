
import React from 'react';
import { AuditTrailDashboard } from '@/components/e-filing/AuditTrail/AuditTrailDashboard';
import { MainLayout } from '@/components/layout/MainLayout';

const AuditTrailPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <AuditTrailDashboard />
      </div>
    </MainLayout>
  );
};

export default AuditTrailPage;
