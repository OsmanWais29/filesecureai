
import { Client } from "@/types/client";

export function ensureClientType(data: any): Client {
  return {
    id: data.id || '',
    name: data.name || '',
    email: data.email,
    phone: data.phone,
    status: data.status || 'inactive',
    location: data.location,
    address: data.address,
    city: data.city,
    province: data.province,
    postalCode: data.postalCode,
    company: data.company,
    occupation: data.occupation,
    mobilePhone: data.mobilePhone,
    notes: data.notes,
    last_interaction: data.last_interaction,
    engagement_score: data.engagement_score || 0,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    metadata: data.metadata || {},
    metrics: data.metrics || { openTasks: 0, pendingDocuments: 0, urgentDeadlines: 0 }
  };
}

import { Document as DocumentListDocument } from "@/components/DocumentList/types";
import { Document as ClientDocument } from "@/types/client";
import { MeetingData } from "@/types/client";

export function convertDocumentListToClientDocument(doc: DocumentListDocument): ClientDocument {
  return {
    id: doc.id,
    title: doc.title,
    type: doc.type || 'document',
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    storage_path: doc.storage_path,
    size: doc.size,
    metadata: doc.metadata || {},
    parent_folder_id: doc.parent_folder_id,
    user_id: doc.user_id || '',
    is_folder: doc.is_folder || false,
    folder_type: doc.folder_type,
    deadlines: doc.deadlines || [],
    status: doc.status || 'pending',
    ai_processing_status: doc.ai_processing_status || 'pending',
    tasks: doc.tasks || [],
    description: doc.description || '',
    url: doc.url
  };
}

export function ensureMeetingType(data: any): MeetingData {
  return {
    id: data.id || '',
    title: data.title || '',
    description: data.description,
    start_time: data.start_time || new Date().toISOString(),
    end_time: data.end_time || new Date().toISOString(),
    client_id: data.client_id,
    attendees: data.attendees || [],
    status: (['scheduled', 'in_progress', 'completed', 'cancelled'].includes(data.status)) 
      ? data.status : 'scheduled',
    meeting_type: data.meeting_type,
    location: data.location,
    metadata: data.metadata || {},
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

// Additional utility functions for type safety
export function convertToClientDocument(data: unknown): ClientDocument {
  const doc = data as any;
  return {
    id: doc.id || '',
    title: doc.title || '',
    type: doc.type || 'document',
    created_at: doc.created_at || new Date().toISOString(),
    updated_at: doc.updated_at || new Date().toISOString(),
    storage_path: doc.storage_path,
    size: doc.size,
    metadata: doc.metadata || {},
    parent_folder_id: doc.parent_folder_id,
    user_id: doc.user_id || '',
    is_folder: doc.is_folder || false,
    folder_type: doc.folder_type,
    deadlines: doc.deadlines || [],
    status: doc.status || 'pending',
    ai_processing_status: doc.ai_processing_status || 'pending',
    tasks: doc.tasks || [],
    description: doc.description || '',
    url: doc.url
  };
}

export function convertToClientProfile(data: unknown): Client {
  const client = data as any;
  return ensureClientType(client);
}

export function convertDocumentArray(data: unknown[]): ClientDocument[] {
  if (!Array.isArray(data)) return [];
  return data.map(convertToClientDocument);
}

export function convertClientArray(data: unknown[]): Client[] {
  if (!Array.isArray(data)) return [];
  return data.map(convertToClientProfile);
}

export function safeGetId(data: unknown): string {
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object' && 'id' in data) {
    return String((data as any).id);
  }
  return '';
}

export function ensureSpreadableObject(data: unknown): Record<string, any> {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as Record<string, any>;
  }
  return {};
}

export function ensureTaskType(data: any): any {
  return {
    id: data.id || '',
    title: data.title || '',
    description: data.description,
    status: (['pending', 'in_progress', 'completed', 'cancelled'].includes(data.status)) 
      ? data.status : 'pending',
    priority: (['low', 'medium', 'high'].includes(data.priority)) 
      ? data.priority : 'medium',
    due_date: data.due_date,
    client_id: data.client_id,
    assigned_to: data.assigned_to,
    created_by: data.created_by || '',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString()
  };
}

export function convertToUserSettings(data: unknown): any {
  const settings = data as any;
  return {
    timeZone: typeof settings?.time_zone === 'string' ? settings.time_zone : 'UTC',
    language: typeof settings?.language === 'string' ? settings.language : 'en',
    autoSave: typeof settings?.auto_save === 'boolean' ? settings.auto_save : true,
    compactView: typeof settings?.compact_view === 'boolean' ? settings.compact_view : false,
    documentSync: typeof settings?.document_sync === 'boolean' ? settings.document_sync : true,
    defaultCurrency: typeof settings?.default_currency === 'string' ? settings.default_currency : 'CAD',
    twoFactorEnabled: typeof settings?.two_factor_enabled === 'boolean' ? settings.two_factor_enabled : false,
    sessionTimeout: typeof settings?.session_timeout === 'string' ? settings.session_timeout : '30',
    ipWhitelisting: typeof settings?.ip_whitelisting === 'boolean' ? settings.ip_whitelisting : false,
    loginNotifications: typeof settings?.login_notifications === 'boolean' ? settings.login_notifications : true,
    documentEncryption: typeof settings?.document_encryption === 'boolean' ? settings.document_encryption : true,
    passwordExpiry: typeof settings?.password_expiry === 'string' ? settings.password_expiry : '90'
  };
}

export function safeStringCast(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
}

export function safeBooleanCast(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return false;
}

// Add the missing safeObjectCast function
export function safeObjectCast(value: unknown): Record<string, any> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, any>;
  }
  return {};
}
