
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export const AnalyticsPage = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">View your application analytics and insights.</p>
        </div>
        <AnalyticsDashboard />
      </div>
    </MainLayout>
  );
};
