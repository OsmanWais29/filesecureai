
import React from 'react';
import { OSBAuditTrailDashboard } from '@/components/e-filing/AuditTrail/OSB/OSBAuditTrailDashboard';
import { MainLayout } from '@/components/layout/MainLayout';

const AuditTrailPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="h-full p-6">
        <OSBAuditTrailDashboard />
      </div>
    </MainLayout>
  );
};

export default AuditTrailPage;
