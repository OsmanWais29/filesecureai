import React from 'react';
import { Directive32AuditDashboard } from '@/components/e-filing/AuditTrail/Directive32/Directive32AuditDashboard';
import { MainLayout } from '@/components/layout/MainLayout';

const AuditTrailPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="h-full p-6">
        <Directive32AuditDashboard />
      </div>
    </MainLayout>
  );
};

export default AuditTrailPage;
