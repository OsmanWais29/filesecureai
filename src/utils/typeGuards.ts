
export const safeStringCast = (value: any): string => {
  return typeof value === 'string' ? value : String(value ?? '');
};

export const safeObjectCast = (value: any): Record<string, any> => {
  return typeof value === 'object' && value !== null ? value : {};
};

export const safeBooleanCast = (value: any): boolean => {
  return typeof value === 'boolean' ? value : (value === 'true' || value === '1' || value === 1);
};

export const safeNumberCast = (value: any): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string' && !isNaN(Number(value))) {
    return Number(value);
  }
  return NaN;
};

// Ensure spreadable object function
export const ensureSpreadableObject = (value: any): Record<string, any> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { ...value };
  }
  return {};
};

// Extended Document interface for documents with additional properties
export interface ExtendedDocument {
  id: string;
  title: string;
  type?: string;
  size?: number;
  storage_path?: string;
  user_id?: string;
  metadata?: Record<string, any>;
  ai_processing_status?: string;
  created_at?: string;
  updated_at?: string;
  parent_folder_id?: string;
  is_folder?: boolean;
  folder_type?: string;
  deadlines?: any[];
  status?: string;
  tasks?: any[];
  description?: string;
}

export const isValidDocument = (doc: any): doc is ExtendedDocument => {
  if (!doc || typeof doc !== 'object') return false;
  
  const id = safeStringCast(doc.id);
  const title = safeStringCast(doc.title);
  
  return !!id && !!title;
};

export const safeDocumentCast = (doc: any): ExtendedDocument | null => {
  if (!isValidDocument(doc)) return null;
  
  return {
    id: safeStringCast(doc.id),
    title: safeStringCast(doc.title),
    type: doc.type ? safeStringCast(doc.type) : undefined,
    size: doc.size ? safeNumberCast(doc.size) : undefined,
    storage_path: doc.storage_path ? safeStringCast(doc.storage_path) : undefined,
    user_id: doc.user_id ? safeStringCast(doc.user_id) : undefined,
    metadata: doc.metadata ? safeObjectCast(doc.metadata) : {},
    ai_processing_status: doc.ai_processing_status ? safeStringCast(doc.ai_processing_status) : undefined,
    created_at: doc.created_at ? safeStringCast(doc.created_at) : undefined,
    updated_at: doc.updated_at ? safeStringCast(doc.updated_at) : undefined,
    parent_folder_id: doc.parent_folder_id ? safeStringCast(doc.parent_folder_id) : undefined,
    is_folder: doc.is_folder ? safeBooleanCast(doc.is_folder) : undefined,
    folder_type: doc.folder_type ? safeStringCast(doc.folder_type) : undefined,
    deadlines: Array.isArray(doc.deadlines) ? doc.deadlines : [],
    status: doc.status ? safeStringCast(doc.status) : undefined,
    tasks: Array.isArray(doc.tasks) ? doc.tasks : [],
    description: doc.description ? safeStringCast(doc.description) : undefined
  };
};

// Client document conversion functions
export const convertToClientDocument = (doc: any): import('@/types/client').Document => {
  return {
    id: safeStringCast(doc.id || ''),
    title: safeStringCast(doc.title || ''),
    type: safeStringCast(doc.type || 'document'),
    created_at: safeStringCast(doc.created_at || new Date().toISOString()),
    updated_at: safeStringCast(doc.updated_at || new Date().toISOString()),
    metadata: safeObjectCast(doc.metadata),
    size: doc.size ? safeNumberCast(doc.size) : undefined,
    storage_path: doc.storage_path ? safeStringCast(doc.storage_path) : undefined,
    ai_processing_status: doc.ai_processing_status ? safeStringCast(doc.ai_processing_status) : undefined
  };
};

export const convertToClientProfile = (profile: any): import('@/types/client').Client => {
  return {
    id: safeStringCast(profile.id || ''),
    name: safeStringCast(profile.name || ''),
    email: profile.email ? safeStringCast(profile.email) : undefined,
    phone: profile.phone ? safeStringCast(profile.phone) : undefined,
    status: safeStringCast(profile.status || 'active'),
    created_at: safeStringCast(profile.created_at || new Date().toISOString()),
    updated_at: safeStringCast(profile.updated_at || new Date().toISOString()),
    metadata: safeObjectCast(profile.metadata)
  };
};

// Document array conversion
export const convertDocumentArray = (docs: any[]): import('@/types/client').Document[] => {
  if (!Array.isArray(docs)) return [];
  return docs.map(convertToClientDocument).filter(doc => doc.id && doc.title);
};

// Document list to client document conversion
export const convertDocumentListToClientDocument = (doc: any): import('@/types/client').Document => {
  return convertToClientDocument(doc);
};

// Meeting type conversion
export const ensureMeetingType = (meeting: any): import('@/types/client').MeetingData => {
  return {
    id: safeStringCast(meeting.id || ''),
    title: safeStringCast(meeting.title || ''),
    start_time: safeStringCast(meeting.start_time || new Date().toISOString()),
    end_time: safeStringCast(meeting.end_time || new Date().toISOString()),
    status: safeStringCast(meeting.status || 'scheduled'),
    client_id: meeting.client_id ? safeStringCast(meeting.client_id) : undefined,
    description: meeting.description ? safeStringCast(meeting.description) : undefined,
    meeting_type: meeting.meeting_type ? safeStringCast(meeting.meeting_type) : undefined,
    location: meeting.location ? safeStringCast(meeting.location) : undefined,
    attendees: Array.isArray(meeting.attendees) ? meeting.attendees : [],
    created_at: safeStringCast(meeting.created_at || new Date().toISOString()),
    updated_at: safeStringCast(meeting.updated_at || new Date().toISOString()),
    metadata: safeObjectCast(meeting.metadata)
  };
};

// Client type conversion
export const ensureClientType = (client: any): import('@/types/client').Client => {
  return convertToClientProfile(client);
};

// Task type conversion
export const ensureTaskType = (task: any): import('@/types/client').Task => {
  return {
    id: safeStringCast(task.id || ''),
    title: safeStringCast(task.title || ''),
    description: task.description ? safeStringCast(task.description) : undefined,
    status: safeStringCast(task.status || 'pending'),
    priority: safeStringCast(task.priority || 'medium'),
    assigned_to: task.assigned_to ? safeStringCast(task.assigned_to) : undefined,
    created_by: task.created_by ? safeStringCast(task.created_by) : undefined,
    due_date: task.due_date ? safeStringCast(task.due_date) : undefined,
    created_at: safeStringCast(task.created_at || new Date().toISOString()),
    updated_at: safeStringCast(task.updated_at || new Date().toISOString()),
    client_id: task.client_id ? safeStringCast(task.client_id) : undefined,
    document_id: task.document_id ? safeStringCast(task.document_id) : undefined,
    metadata: safeObjectCast(task.metadata)
  };
};

// Client array conversion
export const convertClientArray = (clients: any[]): import('@/types/client').Client[] => {
  if (!Array.isArray(clients)) return [];
  return clients.map(convertToClientProfile).filter(client => client.id && client.name);
};
