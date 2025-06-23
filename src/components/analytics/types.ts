
import { LucideIcon } from 'lucide-react';

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  period: string;
  category: 'documents' | 'clients' | 'compliance' | 'operations';
}

export interface DocumentAnalyticsData {
  taskVolume: Array<{
    month: string;
    tasks: number;
    automated: number;
    manual: number;
  }>;
  timeSaved: Array<{
    month: string;
    hours: number;
    cost: number;
  }>;
  errorReduction: Array<{
    month: string;
    errors: number;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface ComplianceMetric {
  complianceRate: number;
  highRiskCases: number;
  auditsCompleted: number;
  avgResolutionDays: number;
  previousHighRiskCases: number;
  auditTarget: number;
  previousResolutionDays: number;
}

export interface ClientMetric {
  activeClients: number;
  newClientsMonthly: number;
  avgCompletionDays: number;
  satisfactionScore: number;
  previousMonthNewClients: number;
  previousAvgCompletionDays: number;
}

export interface OperationalMetric {
  avgCasesPerStaff: number;
  taskCompletionRate: number;
  avgResponseHours: number;
  processEfficiency: number;
  targetCasesPerStaff: number;
  previousEfficiency: number;
}

export interface GeographicData {
  region: string;
  clients: number;
  cases: number;
  growth: number;
  riskLevel: 'low' | 'medium' | 'high';
  complianceRate: number;
}

export interface TrendData {
  period: string;
  value: number;
  target?: number;
  category?: string;
}

export interface RiskAssessment {
  level: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface PerformanceIndicator {
  name: string;
  current: number;
  target: number;
  unit: string;
  status: 'on-track' | 'at-risk' | 'critical';
}

export interface AnalyticsFilter {
  dateRange: '7d' | '30d' | '90d' | '1y' | 'custom';
  category?: string[];
  region?: string[];
  riskLevel?: string[];
  status?: string[];
}

export interface AnalyticsExport {
  format: 'pdf' | 'excel' | 'csv';
  sections: string[];
  filters: AnalyticsFilter;
  scheduledExport?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
}

// New types for analytics categories and modules
export interface AnalyticsModule {
  id: string;
  name: string;
  icon: LucideIcon;
  component: React.ComponentType<any>;
}

export interface CategoryData {
  id: string;
  name: string;
  modules: AnalyticsModule[];
}
