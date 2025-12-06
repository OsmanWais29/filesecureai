import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  Shield, 
  Eye, 
  FileCode, 
  CheckSquare,
  Download,
  Filter
} from "lucide-react";

import { ComplianceIndicators } from "./ComplianceIndicators";
import { AuditLogTable } from "./AuditLogTable";
import { IntegrityLogsTable } from "./IntegrityLogsTable";
import { AccessLogsTable } from "./AccessLogsTable";
import { ConversionLogsTable } from "./ConversionLogsTable";
import { QualityAssuranceTable } from "./QualityAssuranceTable";
import { ExportOptions } from "./ExportOptions";
import { SystemStatusPanel } from "./SystemStatusPanel";
import type { AuditTab } from "./types";

const tabs = [
  { id: "all_activity" as AuditTab, label: "All Activity", icon: Activity },
  { id: "record_integrity" as AuditTab, label: "Record Integrity", icon: Shield },
  { id: "access_logs" as AuditTab, label: "Access Logs", icon: Eye },
  { id: "conversion_logs" as AuditTab, label: "Conversion Logs", icon: FileCode },
  { id: "quality_assurance" as AuditTab, label: "Quality Assurance", icon: CheckSquare },
  { id: "exports" as AuditTab, label: "Exports", icon: Download },
];

export const Directive32AuditDashboard = () => {
  const [activeTab, setActiveTab] = useState<AuditTab>("all_activity");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Audit Trail</h1>
          <p className="text-sm text-muted-foreground">
            Directive 32 Compliant Record Keeping & Verification System
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            System Indicators: All Healthy
          </span>
        </div>
      </div>

      {/* Main Content Area with System Status Panel */}
      <div className="flex flex-1 gap-6 pt-4 overflow-hidden">
        {/* Left Side - Main Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {/* Compliance Indicators - Always Visible */}
            <ComplianceIndicators />

            {/* Navigation Tabs */}
            <Tabs 
              value={activeTab} 
              onValueChange={(v) => setActiveTab(v as AuditTab)}
              className="mt-4"
            >
              <TabsList className="grid w-full grid-cols-6 mb-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden lg:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="all_activity" className="mt-0">
                <AuditLogTable entries={[]} />
              </TabsContent>

              <TabsContent value="record_integrity" className="mt-0">
                <IntegrityLogsTable />
              </TabsContent>

              <TabsContent value="access_logs" className="mt-0">
                <AccessLogsTable />
              </TabsContent>

              <TabsContent value="conversion_logs" className="mt-0">
                <ConversionLogsTable />
              </TabsContent>

              <TabsContent value="quality_assurance" className="mt-0">
                <QualityAssuranceTable />
              </TabsContent>

              <TabsContent value="exports" className="mt-0">
                <ExportOptions />
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </div>

        {/* Right Side - System Status Panel */}
        <div className="w-[320px] flex-shrink-0">
          <ScrollArea className="h-full">
            <SystemStatusPanel />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
