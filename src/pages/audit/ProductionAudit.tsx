
import React from 'react';
import { NavigationAudit } from '@/components/audit/NavigationAudit';
import { MainLayout } from '@/components/layout/MainLayout';

const ProductionAudit: React.FC = () => {
  return (
    <MainLayout>
      <NavigationAudit />
    </MainLayout>
  );
};

export default ProductionAudit;
