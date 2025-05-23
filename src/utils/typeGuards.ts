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
