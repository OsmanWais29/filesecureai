
import { useState } from 'react';
import { ClientMetric } from '../../types';

export const useClientManagementData = () => {
  const [clientMetrics] = useState<ClientMetric>({
    activeClients: 186,
    newClientsMonthly: 23,
    avgCompletionDays: 34,
    satisfactionScore: 8.4,
    previousMonthNewClients: 19,
    previousAvgCompletionDays: 38
  });

  const [casesByStatus] = useState([
    { name: 'Active', value: 89 },
    { name: 'In Review', value: 34 },
    { name: 'Pending', value: 28 },
    { name: 'Completed', value: 142 },
    { name: 'On Hold', value: 12 }
  ]);

  const [clientAcquisitionTrend] = useState([
    { month: 'Jul', clients: 18, target: 20 },
    { month: 'Aug', clients: 22, target: 20 },
    { month: 'Sep', clients: 19, target: 20 },
    { month: 'Oct', clients: 25, target: 20 },
    { month: 'Nov', clients: 21, target: 20 },
    { month: 'Dec', clients: 23, target: 20 }
  ]);

  const [caseCompletionTimes] = useState([
    { type: 'Consumer Proposal', days: 42, target: 45 },
    { type: 'Bankruptcy', days: 28, target: 30 },
    { type: 'Debt Review', days: 21, target: 25 },
    { type: 'Asset Assessment', days: 35, target: 40 },
    { type: 'Filing Review', days: 14, target: 15 }
  ]);

  const [clientChurnRate] = useState([
    { month: 'Jul', rate: 2.1 },
    { month: 'Aug', rate: 1.8 },
    { month: 'Sep', rate: 2.3 },
    { month: 'Oct', rate: 1.9 },
    { month: 'Nov', rate: 1.6 },
    { month: 'Dec', rate: 1.4 }
  ]);

  const [satisfactionScores] = useState([
    { month: 'Jul', nps: 7.8, churn: 2.1 },
    { month: 'Aug', nps: 8.1, churn: 1.8 },
    { month: 'Sep', nps: 7.9, churn: 2.3 },
    { month: 'Oct', nps: 8.3, churn: 1.9 },
    { month: 'Nov', nps: 8.2, churn: 1.6 },
    { month: 'Dec', nps: 8.4, churn: 1.4 }
  ]);

  return {
    clientMetrics,
    casesByStatus,
    clientAcquisitionTrend,
    caseCompletionTimes,
    clientChurnRate,
    satisfactionScores
  };
};
