
import React from 'react';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <AnalyticsDashboard />
    </div>
  );
};

export default AnalyticsPage;
