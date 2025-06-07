
import React from 'react';
import { AuditTrail } from '@/components/audit/AuditTrail';
import { MainLayout } from '@/components/layout/MainLayout';

const AuditTrailPage: React.FC = () => {
  return (
    <MainLayout>
      <AuditTrail />
    </MainLayout>
  );
};

export default AuditTrailPage;
