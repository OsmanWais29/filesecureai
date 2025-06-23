
import { useState } from 'react';
import { OperationalMetric } from '../../types';

export const useOperationalData = () => {
  const [operationalMetrics] = useState<OperationalMetric>({
    avgCasesPerStaff: 12.4,
    taskCompletionRate: 87,
    avgResponseHours: 18.5,
    processEfficiency: 78.3,
    targetCasesPerStaff: 15,
    previousEfficiency: 75.1
  });

  const [staffProductivityData] = useState([
    { name: 'John Smith', activeCases: 15, completedCases: 8, efficiency: 89 },
    { name: 'Sarah Johnson', activeCases: 12, completedCases: 12, efficiency: 92 },
    { name: 'Mike Wilson', activeCases: 18, completedCases: 6, efficiency: 73 },
    { name: 'Lisa Davis', activeCases: 9, completedCases: 14, efficiency: 95 },
    { name: 'David Brown', activeCases: 13, completedCases: 9, efficiency: 84 }
  ]);

  const [taskCompletionData] = useState([
    { week: 'Week 1', completionRate: 85, responseTime: 22 },
    { week: 'Week 2', completionRate: 88, responseTime: 19 },
    { week: 'Week 3', completionRate: 82, responseTime: 24 },
    { week: 'Week 4', completionRate: 91, responseTime: 16 },
    { week: 'Week 5', completionRate: 87, responseTime: 18 }
  ]);

  const [processingTimeData] = useState([
    { process: 'Document Review', current: 24, target: 20 },
    { process: 'Risk Assessment', current: 18, target: 15 },
    { process: 'Client Onboarding', current: 32, target: 30 },
    { process: 'Compliance Check', current: 14, target: 12 },
    { process: 'Final Review', current: 28, target: 25 },
    { process: 'Filing Submission', current: 8, target: 6 }
  ]);

  const [workflowBottlenecks] = useState([
    { stage: 'Document Verification', delay: 3.2, impact: 'High', trend: 'Increasing' },
    { stage: 'Client Response', delay: 5.1, impact: 'Medium', trend: 'Stable' },
    { stage: 'Risk Assessment', delay: 2.8, impact: 'Medium', trend: 'Decreasing' },
    { stage: 'Compliance Review', delay: 1.9, impact: 'Low', trend: 'Stable' },
    { stage: 'Final Approval', delay: 4.3, impact: 'High', trend: 'Increasing' }
  ]);

  return {
    operationalMetrics,
    staffProductivityData,
    taskCompletionData,
    processingTimeData,
    workflowBottlenecks
  };
};
