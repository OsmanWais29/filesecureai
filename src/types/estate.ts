// Estate Types for Creditor Management

export type EstateType = 'bankruptcy' | 'consumer_proposal' | 'ccaa' | 'division_i_proposal';
export type EstateStatus = 'open' | 'in_realization' | 'in_distribution' | 'closed' | 'annulled';

export interface Estate {
  id: string;
  client_id: string;
  debtor_name: string;
  file_number: string;
  estate_type: EstateType;
  status: EstateStatus;
  trustee_id: string;
  trustee_name: string;
  assigned_date: string;
  trust_balance: number;
  total_creditors: number;
  total_claims: number;
  next_deadline?: string;
  next_deadline_description?: string;
  created_at: string;
  updated_at: string;
}

export interface EstateCreditor {
  id: string;
  estate_id: string;
  creditor_id: string;
  external_ref?: string;
  contact_override?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  total_claim_amount: number;
  primary_priority: 'secured' | 'preferred' | 'unsecured';
  ppsa_checked: boolean;
  created_at: string;
  updated_at: string;
}

export interface SAFADecision {
  id: string;
  claim_id?: string;
  estate_id: string;
  safa_version: string;
  decision_type: 'classification' | 'flag' | 'form_prefill' | 'valuation_suggestion';
  confidence_score: number;
  explanation_text: string;
  cited_rules: string[];
  extracted_fields: Record<string, any>;
  evidence_doc_ids: string[];
  created_at: string;
}

export interface AuditEvent {
  id: string;
  estate_id: string;
  user_id: string;
  actor: 'system' | 'user';
  action_type: string;
  payload_hash: string;
  previous_event_id?: string;
  signature?: string;
  description: string;
  created_at: string;
}

export interface OSBForm {
  id: string;
  estate_id: string;
  form_type: string;
  form_number: string;
  title: string;
  status: 'draft' | 'ready' | 'submitted' | 'filed';
  xml_blob?: string;
  pdf_url?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}
