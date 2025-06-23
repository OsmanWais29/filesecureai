
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedRiskAssessment } from '@/components/ai/AdvancedRiskAssessment';
import { EnhancedNotifications } from '@/components/client-portal/EnhancedNotifications';
import { WorkflowAutomation } from '@/components/workflow/WorkflowAutomation';
import { EnhancedSecurity } from '@/components/security/EnhancedSecurity';
import { PerformanceMonitoring } from '@/components/performance/PerformanceMonitoring';
import { ESignatureIntegration } from '@/components/documents/ESignatureIntegration';
import { 
  Brain, 
  Bell, 
  Workflow, 
  Shield, 
  Activity, 
  PenTool 
} from 'lucide-react';

const AdvancedFeaturesPage = () => {
  const [activeTab, setActiveTab] = useState('ai-risk');

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Advanced Features</h1>
          <p className="text-muted-foreground">
            Cutting-edge capabilities to enhance your SecureFiles AI experience
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="ai-risk" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Risk
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="esignature" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              E-Signature
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-risk">
            <AdvancedRiskAssessment />
          </TabsContent>

          <TabsContent value="notifications">
            <EnhancedNotifications />
          </TabsContent>

          <TabsContent value="workflows">
            <WorkflowAutomation />
          </TabsContent>

          <TabsContent value="security">
            <EnhancedSecurity />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceMonitoring />
          </TabsContent>

          <TabsContent value="esignature">
            <ESignatureIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdvancedFeaturesPage;
