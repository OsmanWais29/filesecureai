import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PostureAnalytics } from '@/components/analytics/posture/PostureAnalytics';

export const AnalyticsPage = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Split by audience, not by data source: what the regulator scores, what the firm
            runs on, and how the two compare to published national figures.
          </p>
        </div>
        <PostureAnalytics />
      </div>
    </MainLayout>
  );
};
