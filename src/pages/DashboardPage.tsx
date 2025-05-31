
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Dashboard content coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
