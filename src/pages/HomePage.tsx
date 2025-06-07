
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { HomePage as DashboardHomePage } from '@/components/dashboard/HomePage';

const HomePage: React.FC = () => {
  return (
    <MainLayout showFooter={true}>
      <DashboardHomePage />
    </MainLayout>
  );
};

export default HomePage;
