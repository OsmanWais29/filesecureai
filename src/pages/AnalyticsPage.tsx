
import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AnalyticsSidebar } from "@/components/analytics/AnalyticsSidebar";
import { AnalyticsContent } from "@/components/analytics/AnalyticsContent";
import { RoleDashboards } from "@/components/analytics/RoleDashboards";
import { getAnalyticsCategories } from "@/components/analytics/analyticsCategories";
import { getMockDocumentData } from "@/components/analytics/utils";
import { useEnhancedAnalytics } from "@/hooks/useEnhancedAnalytics";
import { showPerformanceToast } from "@/utils/performance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnomalyDetectionDashboard } from "@/components/analytics/performance/AnomalyDetectionDashboard";
import { Button } from "@/components/ui/button";
import { Presentation, User, BarChart2, TrendingUp } from "lucide-react";

const AnalyticsPage = () => {
  const [activeCategory, setActiveCategory] = useState("business");
  const [activeModule, setActiveModule] = useState("client");
  const [activeTab, setActiveTab] = useState("default");
  const analytics = useEnhancedAnalytics({
    pageName: "AnalyticsDashboard",
    userRole: "admin",
    enablePersistence: true
  });

  // Get categories - memoize to prevent unnecessary recalculations
  const categories = useMemo(() => getAnalyticsCategories(), []);
  
  // Get mock data for DocumentAnalytics component - memoize to prevent recreating on every render
  const documentMockData = useMemo(() => getMockDocumentData(), []);

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === activeCategory) return; // Prevent unnecessary state updates
    
    setActiveCategory(categoryId);
    // Track the category change
    analytics.trackInteraction("AnalyticsSidebar", "CategoryChange", "Navigation", { categoryId });
    
    // Set the first module of the category as active
    const firstModuleId = categories.find(c => c.id === categoryId)?.modules[0]?.id || "";
    setActiveModule(firstModuleId);
  };

  // Handle module change with memoization to prevent recreating on every render
  const handleModuleChange = useMemo(() => (moduleId: string) => {
    if (moduleId === activeModule) return; // Prevent unnecessary state updates
    
    setActiveModule(moduleId);
    analytics.trackInteraction("AnalyticsContent", "ModuleChange", "Navigation", { moduleId });
  }, [activeModule, analytics]);

  useEffect(() => {
    // Show performance toast when dashboard loads
    showPerformanceToast("Analytics Dashboard");
  }, []);

  return (
    <MainLayout>
      <div className="mb-6 max-w-4xl p-6">
        <h1 className="text-3xl font-bold text-primary">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your trustee practice with detailed insights across all operational areas
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 px-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="default" className="flex items-center">
              <Presentation className="mr-2 h-4 w-4" />
              Standard Analytics
            </TabsTrigger>
            <TabsTrigger value="role-based" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Role-Based Dashboards
            </TabsTrigger>
            <TabsTrigger value="anomalies" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Performance Anomalies
            </TabsTrigger>
          </TabsList>
          
          <div>
            <Button 
              variant="outline" 
              onClick={() => analytics.fetchTrendData()}
              disabled={analytics.isLoadingTrends}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              {analytics.isLoadingTrends ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>
        
        <TabsContent value="default" className="mt-0">
          <div className="grid grid-cols-12 gap-6">
            {/* Categories sidebar */}
            <div className="col-span-12 md:col-span-3">
              <AnalyticsSidebar 
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            {/* Main content area */}
            <div className="col-span-12 md:col-span-9">
              <AnalyticsContent 
                categories={categories}
                activeCategory={activeCategory}
                activeModule={activeModule}
                setActiveModule={handleModuleChange}
                documentMockData={documentMockData}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="role-based" className="mt-0">
          <RoleDashboards />
        </TabsContent>
        
        <TabsContent value="anomalies" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Performance Anomaly Detection</CardTitle>
              <CardDescription>
                Automatically detect and analyze performance issues across the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnomalyDetectionDashboard />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default AnalyticsPage;
