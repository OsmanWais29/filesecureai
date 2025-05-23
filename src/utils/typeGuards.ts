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
    type: doc.type || 'document', // Ensure type is always present
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    storage_path: doc.storage_path,
    size: doc.size,
    metadata: doc.metadata || {},
    parent_folder_id: doc.parent_folder_id,
    user_id: doc.user_id,
    is_folder: doc.is_folder || false,
    folder_type: doc.folder_type,
    deadlines: doc.deadlines || [],
    status: doc.status,
    ai_processing_status: doc.ai_processing_status || 'pending',
    tasks: doc.tasks || [],
    description: doc.description,
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
