
import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';
import { analyticsService } from '@/services/analyticsService';

const AnalyticsPage: React.FC = () => {
  const {
    trackEvent,
    trackInteraction,
    getMetrics,
    getEventsByCategory,
    getEventsBySubcategory,
    trendData,
    fetchTrendData,
    isLoadingTrends
  } = useEnhancedAnalytics({
    pageName: 'Analytics',
    userRole: 'admin'
  });

  const [metrics, setMetrics] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    // Load initial data
    setMetrics(getMetrics());
    setCategories(getEventsByCategory());
    
    // Fetch trend data with proper EventCategory type
    fetchTrendData('day', { category: 'navigation' as any });
  }, [getMetrics, getEventsByCategory, fetchTrendData]);

  const handleGenerateTestData = () => {
    // Generate some test analytics data
    trackEvent({
      type: 'test_event',
      category: 'testing'
    });
    
    trackInteraction('AnalyticsPage', 'generate_test_data');
    
    // Refresh metrics
    setMetrics(getMetrics());
    setCategories(getEventsByCategory());
  };

  const handleExportData = () => {
    const data = analyticsService.getAnalyticsData();
    console.log('Analytics data:', data);
    
    trackInteraction('AnalyticsPage', 'export_data');
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <div className="space-x-2">
            <Button onClick={handleGenerateTestData}>Generate Test Data</Button>
            <Button variant="outline" onClick={handleExportData}>Export Data</Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalPageViews || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalInteractions || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalErrors || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Event Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex justify-between items-center">
                  <span>{category.name}</span>
                  <span className="font-bold">{category.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trend Data */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Data</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTrends ? (
              <div>Loading trends...</div>
            ) : (
              <div className="space-y-2">
                {trendData.map((trend, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{trend.date}</span>
                    <span className="font-bold">{trend.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
