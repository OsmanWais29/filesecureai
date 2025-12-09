// Creditor Management Types

export type CreditorType = 'bank' | 'cra' | 'credit_union' | 'collection_agency' | 'government' | 'supplier' | 'individual' | 'other';
export type ClaimPriority = 'secured' | 'preferred' | 'unsecured';
export type ClaimStatus = 'pending' | 'accepted' | 'rejected' | 'disputed' | 'withdrawn';
export type NoticeType = 'filing_acknowledgment' | 'missing_docs' | 'deficiency' | 'meeting' | 'disallowance' | 'dividend' | 'final_statement';

export interface Creditor {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  email?: string;
  phone?: string;
  fax?: string;
  creditor_type: CreditorType;
  account_number?: string;
  contact_person?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  estate_id?: string;
}

export interface Claim {
  id: string;
  creditor_id: string;
  estate_id: string;
  claim_amount: number;
  secured_amount: number;
  preferred_amount: number;
  unsecured_amount: number;
  priority: ClaimPriority;
  status: ClaimStatus;
  filing_date: string;
  is_late_filing: boolean;
  collateral_description?: string;
  collateral_value?: number;
  supporting_documents: string[];
  proof_of_claim_doc_id?: string;
  osb_compliant: boolean;
  validation_notes?: string;
  ai_flags: AIFlag[];
  created_at: string;
  updated_at: string;
}

export interface AIFlag {
  id: string;
  type: 'duplicate' | 'incorrect_status' | 'missing_docs' | 'misclassified' | 'risk_alert' | 'amount_discrepancy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion?: string;
  bia_reference?: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

export interface CreditorNotice {
  id: string;
  creditor_id: string;
  notice_type: NoticeType;
  subject: string;
  content: string;
  sent_at: string;
  sent_via: 'email' | 'mail' | 'fax' | 'portal';
  read_at?: string;
  delivery_status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  document_id?: string;
}

export interface MeetingOfCreditors {
  id: string;
  estate_id: string;
  meeting_date: string;
  meeting_time: string;
  location: string;
  meeting_type: 'first' | 'subsequent' | 'special';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  quorum_met: boolean;
  total_eligible_voters: number;
  total_votes_cast: number;
  total_claim_amount_voting: number;
  agenda?: string;
  minutes?: string;
  votes: CreditorVote[];
  created_at: string;
}

export interface CreditorVote {
  creditor_id: string;
  creditor_name: string;
  claim_amount: number;
  vote: 'for' | 'against' | 'abstain';
  proxy_holder?: string;
  recorded_at: string;
}

export interface Distribution {
  id: string;
  estate_id: string;
  distribution_date: string;
  total_receipts: number;
  total_disbursements: number;
  trustee_fees: number;
  levy_amount: number;
  sales_tax: number;
  secured_distribution: number;
  preferred_distribution: number;
  unsecured_distribution: number;
  dividend_rate: number;
  status: 'draft' | 'approved' | 'distributed' | 'final';
  distributions: CreditorDistribution[];
}

export interface CreditorDistribution {
  creditor_id: string;
  creditor_name: string;
  claim_amount: number;
  priority: ClaimPriority;
  distribution_amount: number;
  dividend_percentage: number;
}

export interface CreditorStats {
  total_creditors: number;
  claims_filed: number;
  claims_accepted: number;
  claims_rejected: number;
  claims_pending: number;
  total_secured: number;
  total_preferred: number;
  total_unsecured: number;
  total_claim_amount: number;
  critical_flags: number;
  missing_docs_count: number;
  late_filings: number;
}
