
import { Client } from '../types';

const currentTimestamp = new Date().toISOString();

export const getClientData = (clientId: string): Client => {
  const clientDataMap: Record<string, Client> = {
    'josh-hart': {
      id: 'josh-hart',
      name: 'Josh Hart',
      status: 'active',
      location: 'Toronto, ON',
      email: 'josh.hart@email.com',
      phone: '(416) 555-0123',
      address: '123 Main Street',
      city: 'Toronto',
      province: 'Ontario',
      postalCode: 'M5V 3A8',
      company: 'Hart Consulting Inc.',
      occupation: 'Financial Consultant',
      mobilePhone: '(416) 555-0456',
      notes: 'High-value client requiring specialized bankruptcy consultation.',
      created_at: currentTimestamp,
      updated_at: currentTimestamp,
      metrics: {
        openTasks: 3,
        pendingDocuments: 2,
        urgentDeadlines: 1
      },
      last_interaction: '2024-01-15T10:30:00Z',
      engagement_score: 85
    },
    'sarah-johnson': {
      id: 'sarah-johnson',
      name: 'Sarah Johnson',
      status: 'active',
      location: 'Vancouver, BC',
      email: 'sarah.johnson@email.com',
      phone: '(604) 555-0198',
      address: '456 Oak Avenue',
      city: 'Vancouver',
      province: 'British Columbia',
      postalCode: 'V6B 2K9',
      company: 'Johnson Enterprises',
      occupation: 'Business Owner',
      mobilePhone: '(604) 555-0321',
      notes: 'Business restructuring case with multiple creditors.',
      created_at: currentTimestamp,
      updated_at: currentTimestamp,
      metrics: {
        openTasks: 5,
        pendingDocuments: 3,
        urgentDeadlines: 2
      },
      last_interaction: '2024-01-12T14:20:00Z',
      engagement_score: 92
    },
    'michael-chen': {
      id: 'michael-chen',
      name: 'Michael Chen',
      status: 'pending',
      location: 'Calgary, AB',
      email: 'michael.chen@email.com',
      phone: '(403) 555-0156',
      address: '789 Pine Street',
      city: 'Calgary',
      province: 'Alberta',
      postalCode: 'T2P 1A1',
      company: 'Chen Manufacturing Ltd.',
      occupation: 'Manufacturing Manager',
      mobilePhone: '(403) 555-0789',
      notes: 'Consumer proposal assessment in progress.',
      created_at: currentTimestamp,
      updated_at: currentTimestamp,
      metrics: {
        openTasks: 2,
        pendingDocuments: 4,
        urgentDeadlines: 0
      },
      last_interaction: '2024-01-10T09:15:00Z',
      engagement_score: 67
    },
    'default': {
      id: 'default-client',
      name: 'Sample Client',
      status: 'active',
      location: 'Toronto, ON',
      created_at: currentTimestamp,
      updated_at: currentTimestamp,
      metrics: {
        openTasks: 0,
        pendingDocuments: 0,
        urgentDeadlines: 0
      }
    }
  };

  return clientDataMap[clientId] || clientDataMap.default;
};
