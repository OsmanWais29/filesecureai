
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { HomePage as DashboardHome } from '@/components/dashboard/HomePage';

const HomePage: React.FC = () => {
  return (
    <MainLayout>
      <DashboardHome />
    </MainLayout>
  );
};

export default HomePage;
