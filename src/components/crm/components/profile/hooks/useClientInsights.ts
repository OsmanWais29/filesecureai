
import { useState, useEffect } from 'react';
import { ClientInsightData } from '@/components/activity/hooks/predictiveData/types';

export const useClientInsights = () => {
  const [insights, setInsights] = useState<ClientInsightData>({
    riskLevel: 'medium',
    riskScore: 75,
    caseProgress: 65,
    recentActivities: [
      {
        id: '1',
        type: 'email',
        action: 'Sent document requirements email',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'call',
        action: 'Initial consultation call completed',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'meeting',
        action: 'Document review meeting scheduled',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: 'note',
        action: 'Added case assessment notes',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    clientProfile: {
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      company: 'Doe Enterprises',
      role: 'Business Owner',
      assignedAgent: 'Sarah Johnson',
      tags: ['High Priority', 'Corporate', 'Complex Case'],
      avatarUrl: undefined,
    },
    aiSuggestions: [
      {
        id: '1',
        type: 'warning',
        message: 'Client has not responded to document request for 5 days',
        action: 'Send follow-up reminder',
      },
      {
        id: '2',
        type: 'info',
        message: 'Consider scheduling a status update meeting',
        action: 'Schedule Meeting',
      },
      {
        id: '3',
        type: 'urgent',
        message: 'Deadline approaching for Form 47 submission',
        action: 'Review deadline',
      },
    ],
    milestones: [
      { name: 'Initial Consultation', completed: true },
      { name: 'Document Collection', completed: false },
      { name: 'Risk Assessment', completed: false },
      { name: 'Proposal Preparation', completed: false },
      { name: 'Final Submission', completed: false },
    ],
    clientNotes: [
      {
        title: 'Initial Assessment',
        content: 'Client shows strong commitment to resolution. Complex financial structure requires detailed analysis.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        attachments: ['financial_overview.pdf', 'asset_list.xlsx'],
      },
      {
        title: 'Follow-up Actions',
        content: 'Need to obtain additional documentation for creditor verification.',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        attachments: [],
      },
    ],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState('John Doe');

  const refreshInsights = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setInsights(prev => ({
        ...prev,
        riskScore: Math.floor(Math.random() * 100),
        caseProgress: Math.floor(Math.random() * 100),
      }));
      setIsLoading(false);
    }, 1000);
  };

  return {
    insights,
    isLoading,
    selectedClient,
    setSelectedClient,
    refreshInsights,
  };
};
