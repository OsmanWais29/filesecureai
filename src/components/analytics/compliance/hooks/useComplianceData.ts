
import { useState, useEffect } from 'react';
import { ComplianceMetric } from '../../types';

export const useComplianceData = () => {
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric>({
    complianceRate: 94.2,
    highRiskCases: 8,
    auditsCompleted: 12,
    avgResolutionDays: 4.2,
    previousHighRiskCases: 11,
    auditTarget: 15,
    previousResolutionDays: 5.8
  });

  const [complianceRateHistory] = useState([
    { month: 'Jul', rate: 91.2, target: 95 },
    { month: 'Aug', rate: 92.1, target: 95 },
    { month: 'Sep', rate: 93.5, target: 95 },
    { month: 'Oct', rate: 93.8, target: 95 },
    { month: 'Nov', rate: 94.0, target: 95 },
    { month: 'Dec', rate: 94.2, target: 95 }
  ]);

  const [riskDistribution] = useState([
    { name: 'Low Risk', value: 156 },
    { name: 'Medium Risk', value: 42 },
    { name: 'High Risk', value: 8 },
    { name: 'Critical', value: 2 }
  ]);

  const [auditData] = useState([
    { date: '2024-01-15', type: 'Internal', issuesFound: 3, status: 'Completed' },
    { date: '2024-01-08', type: 'Compliance', issuesFound: 1, status: 'Completed' },
    { date: '2024-12-28', type: 'Risk Assessment', issuesFound: 5, status: 'In Progress' },
    { date: '2024-12-20', type: 'Process Review', issuesFound: 2, status: 'Completed' },
    { date: '2024-12-15', type: 'Documentation', issuesFound: 0, status: 'Completed' }
  ]);

  const [complianceBreaches] = useState([
    { month: 'Jul', documentation: 3, deadlines: 2, financials: 1, other: 1 },
    { month: 'Aug', documentation: 2, deadlines: 3, financials: 2, other: 0 },
    { month: 'Sep', documentation: 1, deadlines: 1, financials: 1, other: 2 },
    { month: 'Oct', documentation: 2, deadlines: 0, financials: 1, other: 1 },
    { month: 'Nov', documentation: 1, deadlines: 2, financials: 0, other: 0 },
    { month: 'Dec', documentation: 0, deadlines: 1, financials: 1, other: 1 }
  ]);

  const [riskTrends] = useState([
    { month: 'Jul', high: 12, medium: 38, low: 142 },
    { month: 'Aug', high: 10, medium: 41, low: 147 },
    { month: 'Sep', high: 9, medium: 39, low: 152 },
    { month: 'Oct', high: 11, medium: 42, low: 149 },
    { month: 'Nov', high: 8, medium: 40, low: 158 },
    { month: 'Dec', high: 8, medium: 42, low: 156 }
  ]);

  return {
    complianceMetrics,
    complianceRateHistory,
    riskDistribution,
    auditData,
    complianceBreaches,
    riskTrends
  };
};
