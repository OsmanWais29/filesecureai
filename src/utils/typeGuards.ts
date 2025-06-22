
export const safeStringCast = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
};

export const safeNumberCast = (value: unknown): number => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const safeBooleanCast = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (typeof value === 'number') return value !== 0;
  return false;
};

export const safeArrayCast = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  return [];
};

export const safeObjectCast = (value: unknown): Record<string, any> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, any>;
  }
  return {};
};

export const safeJSONParse = (value: string): any => {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Document conversion functions
export const convertToClientDocument = (doc: any): any => {
  if (!doc) return null;
  return {
    id: safeStringCast(doc.id),
    title: safeStringCast(doc.title || doc.name || 'Untitled'),
    type: safeStringCast(doc.type || 'document'),
    created_at: safeStringCast(doc.created_at || new Date().toISOString()),
    updated_at: safeStringCast(doc.updated_at || new Date().toISOString()),
    size: safeNumberCast(doc.size || 0),
    metadata: safeObjectCast(doc.metadata || {}),
    storage_path: safeStringCast(doc.storage_path || ''),
    user_id: safeStringCast(doc.user_id || ''),
    is_folder: safeBooleanCast(doc.is_folder || false),
    parent_folder_id: doc.parent_folder_id ? safeStringCast(doc.parent_folder_id) : null
  };
};

export const convertToClientProfile = (profile: any): any => {
  if (!profile) return null;
  return {
    id: safeStringCast(profile.id),
    name: safeStringCast(profile.name || profile.full_name || 'Unknown'),
    email: safeStringCast(profile.email || ''),
    phone: safeStringCast(profile.phone || ''),
    status: safeStringCast(profile.status || 'active'),
    created_at: safeStringCast(profile.created_at || new Date().toISOString()),
    updated_at: safeStringCast(profile.updated_at || new Date().toISOString()),
    metadata: safeObjectCast(profile.metadata || {})
  };
};

export const convertDocumentArray = (docs: unknown): any[] => {
  const safeArray = safeArrayCast(docs);
  return safeArray.map(convertToClientDocument).filter(doc => doc && doc.id);
};

export const convertDocumentListToClientDocument = (docs: unknown): any[] => {
  return convertDocumentArray(docs);
};

export const convertClientArray = (clients: unknown): any[] => {
  const safeArray = safeArrayCast(clients);
  return safeArray.map(convertToClientProfile).filter(client => client && client.id);
};

// Type guards
export const ensureClientType = (client: unknown): any => {
  return convertToClientProfile(client);
};

export const ensureTaskType = (task: unknown): any => {
  if (!task) return null;
  const obj = safeObjectCast(task);
  return {
    id: safeStringCast(obj.id),
    title: safeStringCast(obj.title || 'Untitled Task'),
    description: safeStringCast(obj.description || ''),
    status: safeStringCast(obj.status || 'pending'),
    created_at: safeStringCast(obj.created_at || new Date().toISOString()),
    updated_at: safeStringCast(obj.updated_at || new Date().toISOString()),
    due_date: obj.due_date ? safeStringCast(obj.due_date) : null,
    assigned_to: obj.assigned_to ? safeStringCast(obj.assigned_to) : null,
    created_by: obj.created_by ? safeStringCast(obj.created_by) : null
  };
};

export const ensureMeetingType = (meeting: unknown): any => {
  if (!meeting) return null;
  const obj = safeObjectCast(meeting);
  return {
    id: safeStringCast(obj.id),
    title: safeStringCast(obj.title || 'Untitled Meeting'),
    start_time: safeStringCast(obj.start_time || new Date().toISOString()),
    end_time: safeStringCast(obj.end_time || new Date().toISOString()),
    status: safeStringCast(obj.status || 'scheduled'),
    description: safeStringCast(obj.description || ''),
    location: safeStringCast(obj.location || ''),
    created_at: safeStringCast(obj.created_at || new Date().toISOString()),
    updated_at: safeStringCast(obj.updated_at || new Date().toISOString()),
    client_id: obj.client_id ? safeStringCast(obj.client_id) : null,
    trustee_id: obj.trustee_id ? safeStringCast(obj.trustee_id) : null,
    metadata: safeObjectCast(obj.metadata || {})
  };
};
