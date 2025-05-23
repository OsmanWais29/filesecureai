
import { Document, Task, Client, MeetingData } from '@/types/client';

export const ensureDocumentType = (doc: unknown): Document => {
  const docObj = doc as Record<string, any>;
  return {
    id: String(docObj.id || ''),
    title: String(docObj.title || 'Untitled'),
    type: String(docObj.type || 'document'),
    created_at: String(docObj.created_at || new Date().toISOString()),
    updated_at: String(docObj.updated_at || new Date().toISOString()),
    storage_path: docObj.storage_path ? String(docObj.storage_path) : undefined,
    size: typeof docObj.size === 'number' ? docObj.size : undefined,
    metadata: docObj.metadata || {},
    parent_folder_id: docObj.parent_folder_id ? String(docObj.parent_folder_id) : undefined,
    user_id: docObj.user_id ? String(docObj.user_id) : undefined,
    is_folder: Boolean(docObj.is_folder),
    folder_type: docObj.folder_type ? String(docObj.folder_type) : undefined,
    deadlines: docObj.deadlines || [],
    status: docObj.status ? String(docObj.status) : undefined,
    ai_processing_status: docObj.ai_processing_status ? String(docObj.ai_processing_status) : undefined,
    tasks: docObj.tasks || [],
    description: docObj.description ? String(docObj.description) : undefined,
    url: docObj.url ? String(docObj.url) : undefined
  };
};

export const ensureTaskType = (task: unknown): Task => {
  const taskObj = task as Record<string, any>;
  return {
    id: String(taskObj.id || ''),
    title: String(taskObj.title || 'Untitled Task'),
    description: taskObj.description ? String(taskObj.description) : undefined,
    status: ['pending', 'in_progress', 'completed', 'cancelled'].includes(taskObj.status) ? taskObj.status : 'pending',
    priority: ['low', 'medium', 'high'].includes(taskObj.priority) ? taskObj.priority : 'medium',
    due_date: taskObj.due_date ? String(taskObj.due_date) : undefined,
    client_id: taskObj.client_id ? String(taskObj.client_id) : undefined,
    assigned_to: taskObj.assigned_to ? String(taskObj.assigned_to) : undefined,
    created_by: String(taskObj.created_by || ''),
    created_at: String(taskObj.created_at || new Date().toISOString()),
    updated_at: String(taskObj.updated_at || new Date().toISOString())
  };
};

export const ensureClientType = (client: unknown): Client => {
  const clientObj = client as Record<string, any>;
  return {
    id: String(clientObj.id || ''),
    name: String(clientObj.name || 'Unknown'),
    email: clientObj.email ? String(clientObj.email) : undefined,
    phone: clientObj.phone ? String(clientObj.phone) : undefined,
    status: ['active', 'inactive', 'pending'].includes(clientObj.status) ? clientObj.status : 'pending',
    location: clientObj.location ? String(clientObj.location) : undefined,
    address: clientObj.address ? String(clientObj.address) : undefined,
    city: clientObj.city ? String(clientObj.city) : undefined,
    province: clientObj.province ? String(clientObj.province) : undefined,
    postalCode: clientObj.postalCode ? String(clientObj.postalCode) : undefined,
    company: clientObj.company ? String(clientObj.company) : undefined,
    occupation: clientObj.occupation ? String(clientObj.occupation) : undefined,
    mobilePhone: clientObj.mobilePhone ? String(clientObj.mobilePhone) : undefined,
    notes: clientObj.notes ? String(clientObj.notes) : undefined,
    last_interaction: clientObj.last_interaction ? String(clientObj.last_interaction) : undefined,
    engagement_score: typeof clientObj.engagement_score === 'number' ? clientObj.engagement_score : 0,
    created_at: String(clientObj.created_at || new Date().toISOString()),
    updated_at: String(clientObj.updated_at || new Date().toISOString()),
    metadata: clientObj.metadata || {},
    metrics: clientObj.metrics || {
      openTasks: 0,
      pendingDocuments: 0,
      urgentDeadlines: 0
    }
  };
};

export const ensureMeetingType = (meeting: unknown): MeetingData => {
  const meetingObj = meeting as Record<string, any>;
  return {
    id: String(meetingObj.id || ''),
    title: String(meetingObj.title || 'Untitled Meeting'),
    description: meetingObj.description ? String(meetingObj.description) : undefined,
    start_time: String(meetingObj.start_time || new Date().toISOString()),
    end_time: String(meetingObj.end_time || new Date().toISOString()),
    client_id: meetingObj.client_id ? String(meetingObj.client_id) : undefined,
    attendees: meetingObj.attendees || [],
    status: ['scheduled', 'in_progress', 'completed', 'cancelled'].includes(meetingObj.status) ? meetingObj.status : 'scheduled',
    meeting_type: meetingObj.meeting_type ? String(meetingObj.meeting_type) : undefined,
    location: meetingObj.location ? String(meetingObj.location) : undefined,
    metadata: meetingObj.metadata || {},
    created_at: String(meetingObj.created_at || new Date().toISOString()),
    updated_at: String(meetingObj.updated_at || new Date().toISOString())
  };
};

export const safeStringConvert = (value: unknown, defaultValue: string = ''): string => {
  return typeof value === 'string' ? value : defaultValue;
};

export const safeBooleanConvert = (value: unknown, defaultValue: boolean = false): boolean => {
  return typeof value === 'boolean' ? value : defaultValue;
};

export const safeNumberConvert = (value: unknown, defaultValue: number = 0): number => {
  return typeof value === 'number' ? value : defaultValue;
};

export const ensureSpreadableObject = (obj: unknown): Record<string, any> => {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    return obj as Record<string, any>;
  }
  return {};
};
