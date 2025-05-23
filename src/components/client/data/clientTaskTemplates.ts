
import { Task } from '../types';

const currentTimestamp = new Date().toISOString();

export const getClientTasks = (clientId: string): Task[] => {
  const taskTemplates: Record<string, Task[]> = {
    'josh-hart': [
      {
        id: 'task-1',
        title: 'Review Financial Statements',
        dueDate: '2024-02-15',
        status: 'pending',
        priority: 'high',
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
        created_by: 'system'
      },
      {
        id: 'task-2',
        title: 'Complete Form 47 Validation',
        dueDate: '2024-02-20',
        status: 'in-progress',
        priority: 'medium',
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
        created_by: 'system'
      }
    ],
    'sarah-johnson': [
      {
        id: 'task-3',
        title: 'Asset Valuation Assessment',
        dueDate: '2024-02-10',
        status: 'completed',
        priority: 'low',
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
        created_by: 'system'
      },
      {
        id: 'task-4',
        title: 'Creditor Meeting Schedule',
        dueDate: '2024-02-25',
        status: 'pending',
        priority: 'high',
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
        created_by: 'system'
      },
      {
        id: 'task-5',
        title: 'Documentation Review',
        dueDate: '2024-02-18',
        status: 'in-progress',
        priority: 'medium',
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
        created_by: 'system'
      }
    ],
    'michael-chen': [
      {
        id: 'task-6',
        title: 'Consumer Proposal Draft',
        dueDate: '2024-02-28',
        status: 'pending',
        priority: 'medium',
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
        created_by: 'system'
      },
      {
        id: 'task-7',
        title: 'Income Verification',
        dueDate: '2024-02-22',
        status: 'in-progress',
        priority: 'high',
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
        created_by: 'system'
      }
    ]
  };

  return taskTemplates[clientId] || [];
};
