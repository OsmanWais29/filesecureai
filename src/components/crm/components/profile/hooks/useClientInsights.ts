
import { useState, useEffect } from 'react';
import { ClientInsightData } from '@/components/activity/hooks/predictiveData/types';

// Mock client data for demonstration
const mockClientData: Record<string, ClientInsightData> = {
  'John Doe': {
    riskLevel: 'medium',
    riskScore: 75,
    complianceStatus: 'issues',
    caseProgress: 65,
    pendingTasks: [
      {
        id: 'task-1',
        title: 'Complete Form 47 review',
        priority: 'high',
      },
      {
        id: 'task-2', 
        title: 'Follow up on missing documents',
        priority: 'medium',
      },
    ],
    missingDocuments: [
      'Bank Statement - November 2024',
      'Income Verification Letter',
    ],
    upcomingDeadlines: [
      {
        id: 'deadline-1',
        title: 'Form 47 Submission',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
      },
      {
        id: 'deadline-2',
        title: 'Monthly Review Meeting',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
      },
    ],
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
  },
  'Jane Smith': {
    riskLevel: 'low',
    riskScore: 85,
    complianceStatus: 'compliant',
    caseProgress: 90,
    pendingTasks: [
      {
        id: 'task-3',
        title: 'Final review before submission',
        priority: 'low',
      },
    ],
    missingDocuments: [],
    upcomingDeadlines: [
      {
        id: 'deadline-3',
        title: 'Final Documentation',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'low',
      },
    ],
    recentActivities: [
      {
        id: '5',
        type: 'meeting',
        action: 'Final consultation completed',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '6',
        type: 'email',
        action: 'Confirmation email sent',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ],
    clientProfile: {
      email: 'jane.smith@email.com',
      phone: '+1 (555) 987-6543',
      company: 'Smith Consulting',
      role: 'Consultant',
      assignedAgent: 'Mike Johnson',
      tags: ['Standard Case', 'Responsive'],
      avatarUrl: undefined,
    },
    aiSuggestions: [
      {
        id: '4',
        type: 'info',
        message: 'Case progressing well, nearly complete',
        action: 'Prepare final documents',
      },
    ],
    milestones: [
      { name: 'Initial Consultation', completed: true },
      { name: 'Document Collection', completed: true },
      { name: 'Risk Assessment', completed: true },
      { name: 'Proposal Preparation', completed: true },
      { name: 'Final Submission', completed: false },
    ],
    clientNotes: [
      {
        title: 'Progress Update',
        content: 'Excellent cooperation from client. All documents received on time.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        attachments: ['progress_report.pdf'],
      },
    ],
  },
  'Mike Johnson': {
    riskLevel: 'high',
    riskScore: 35,
    complianceStatus: 'critical',
    caseProgress: 25,
    pendingTasks: [
      {
        id: 'task-4',
        title: 'Urgent document collection',
        priority: 'high',
      },
      {
        id: 'task-5',
        title: 'Compliance review required',
        priority: 'high',
      },
    ],
    missingDocuments: [
      'Financial Statements',
      'Asset Valuation',
      'Creditor List',
    ],
    upcomingDeadlines: [
      {
        id: 'deadline-4',
        title: 'Compliance Deadline',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
      },
    ],
    recentActivities: [
      {
        id: '7',
        type: 'call',
        action: 'Attempted follow-up call - no answer',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '8',
        type: 'email',
        action: 'Urgent reminder sent',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
    ],
    clientProfile: {
      email: 'mike.johnson@email.com',
      phone: '+1 (555) 456-7890',
      company: 'Johnson Industries',
      role: 'CEO',
      assignedAgent: 'Sarah Johnson',
      tags: ['High Risk', 'Urgent', 'Corporate'],
      avatarUrl: undefined,
    },
    aiSuggestions: [
      {
        id: '5',
        type: 'urgent',
        message: 'Critical deadline approaching - immediate action required',
        action: 'Schedule emergency meeting',
      },
      {
        id: '6',
        type: 'warning',
        message: 'Client non-responsive for 48 hours',
        action: 'Escalate to senior trustee',
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
        title: 'Urgent Follow-up Required',
        content: 'Client has missed multiple deadlines. Immediate intervention needed.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        attachments: [],
      },
    ],
  },
  'Sarah Wilson': {
    riskLevel: 'medium',
    riskScore: 68,
    complianceStatus: 'issues',
    caseProgress: 55,
    pendingTasks: [
      {
        id: 'task-6',
        title: 'Review updated financial documents',
        priority: 'medium',
      },
    ],
    missingDocuments: [
      'Updated Bank Statements',
    ],
    upcomingDeadlines: [
      {
        id: 'deadline-5',
        title: 'Document Review',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
      },
    ],
    recentActivities: [
      {
        id: '9',
        type: 'meeting',
        action: 'Progress review meeting completed',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    clientProfile: {
      email: 'sarah.wilson@email.com',
      phone: '+1 (555) 321-0987',
      company: 'Wilson & Associates',
      role: 'Partner',
      assignedAgent: 'Mike Johnson',
      tags: ['Progress Review', 'Partnership'],
      avatarUrl: undefined,
    },
    aiSuggestions: [
      {
        id: '7',
        type: 'info',
        message: 'Regular progress updates needed',
        action: 'Schedule weekly check-ins',
      },
    ],
    milestones: [
      { name: 'Initial Consultation', completed: true },
      { name: 'Document Collection', completed: true },
      { name: 'Risk Assessment', completed: false },
      { name: 'Proposal Preparation', completed: false },
      { name: 'Final Submission', completed: false },
    ],
    clientNotes: [
      {
        title: 'Progress Review',
        content: 'Making steady progress. Client cooperative and responsive.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        attachments: ['progress_notes.pdf'],
      },
    ],
  },
};

export const useClientInsights = () => {
  const [selectedClient, setSelectedClient] = useState('John Doe');
  const [insights, setInsights] = useState<ClientInsightData>(mockClientData['John Doe']);
  const [isLoading, setIsLoading] = useState(false);

  // Available clients list
  const availableClients = Object.keys(mockClientData);

  const refreshInsights = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const currentData = mockClientData[selectedClient];
      setInsights({
        ...currentData,
        riskScore: Math.floor(Math.random() * 100),
        caseProgress: Math.floor(Math.random() * 100),
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleClientSelect = (clientName: string) => {
    if (mockClientData[clientName]) {
      setSelectedClient(clientName);
      setInsights(mockClientData[clientName]);
    }
  };

  // Update insights when selectedClient changes
  useEffect(() => {
    if (mockClientData[selectedClient]) {
      setInsights(mockClientData[selectedClient]);
    }
  }, [selectedClient]);

  return {
    insights,
    isLoading,
    selectedClient,
    setSelectedClient: handleClientSelect,
    refreshInsights,
    availableClients,
  };
};
