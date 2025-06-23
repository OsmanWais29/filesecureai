
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Shield, 
  TrendingUp, 
  Calendar,
  Download,
  Filter,
  Settings
} from 'lucide-react';
import { DocumentAnalytics } from './documents/DocumentAnalytics';
import { ComplianceAnalytics } from './compliance/ComplianceAnalytics';
import { ClientManagementAnalytics } from './client/ClientManagementAnalytics';
import { OperationalEfficiencyAnalytics } from './operational/OperationalEfficiencyAnalytics';
import { GeographicAnalytics } from './geographic/GeographicAnalytics';
import { MarketingAnalytics } from './marketing/MarketingAnalytics';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';

export const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  
  const analytics = useEnhancedAnalytics({
    pageName: 'Analytics Dashboard',
    userRole: 'trustee',
    enablePersistence: true
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    analytics.trackInteraction('Analytics', 'TabChange', { tab: value });
  };

  const handleExportReport = () => {
    analytics.trackInteraction('Analytics', 'ExportReport', { tab: activeTab });
    // Export logic would go here
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your SecureFiles AI operations
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="geographic" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Geographic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">186</div>
                <p className="text-xs text-muted-foreground">+4 new this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">+2.1% improvement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18.5h</div>
                <p className="text-xs text-muted-foreground">-3.2h faster</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MarketingAnalytics />
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <DocumentAnalytics />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceAnalytics />
        </TabsContent>

        <TabsContent value="clients">
          <ClientManagementAnalytics />
        </TabsContent>

        <TabsContent value="operations">
          <OperationalEfficiencyAnalytics />
        </TabsContent>

        <TabsContent value="geographic">
          <GeographicAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};
