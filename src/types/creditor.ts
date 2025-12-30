// Creditor Management Types - OSB/BIA Compliant

// Extended creditor types for trustee workflows
export type CreditorType = 
  | 'financial_institution' 
  | 'government' 
  | 'secured_lender' 
  | 'individual' 
  | 'trade_creditor' 
  | 'other';

// Government sub-types for statutory compliance
export type GovernmentCreditorType = 
  | 'cra' 
  | 'service_canada' 
  | 'provincial' 
  | 'municipal';

// CRA claim types for deemed trust handling
export type CRAClaimType = 
  | 'source_deductions' 
  | 'gst_hst' 
  | 'corporate_income_tax' 
  | 'personal_income_tax' 
  | 'payroll_tax';

// Security types for secured creditors
export type SecurityType = 
  | 'mortgage' 
  | 'ppsa' 
  | 'lien' 
  | 'statutory' 
  | 'other';

export type ClaimPriority = 'secured' | 'preferred' | 'unsecured';
export type ClaimStatus = 'pending' | 'filed' | 'admitted' | 'disputed' | 'rejected' | 'withdrawn';
export type ClaimFiledStatus = 'yes' | 'no' | 'not_yet_filed';
export type NoticeType = 'filing_acknowledgment' | 'missing_docs' | 'deficiency' | 'meeting' | 'disallowance' | 'dividend' | 'final_statement';

// Nature of claim categories
export type ClaimNature = 
  | 'tax' 
  | 'loan' 
  | 'credit_card' 
  | 'judgment' 
  | 'lease' 
  | 'support_maintenance' 
  | 'trade_debt'
  | 'wages'
  | 'other';

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
  government_type?: GovernmentCreditorType;
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
  
  // Security information
  security_type?: SecurityType;
  collateral_description?: string;
  collateral_value?: number;
  ppsa_registration_number?: string;
  ppsa_province?: string;
  ppsa_registration_date?: string;
  
  // Government/CRA specific
  cra_claim_type?: CRAClaimType;
  deemed_trust_applies?: boolean;
  super_priority_applies?: boolean;
  
  // Claim details
  claim_nature?: ClaimNature;
  claim_filed?: ClaimFiledStatus;
  expected_filing_deadline?: string;
  contract_loan_id?: string;
  currency?: string;
  
  // Documents and compliance
  supporting_documents: string[];
  proof_of_claim_doc_id?: string;
  osb_compliant: boolean;
  validation_notes?: string;
  ai_flags: AIFlag[];
  
  // Dispute handling
  dispute_reason?: string;
  trustee_notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface AIFlag {
  id: string;
  type: 'duplicate' | 'incorrect_status' | 'missing_docs' | 'misclassified' | 'risk_alert' | 'amount_discrepancy' | 'priority_validation' | 'late_filing' | 'security_mismatch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion?: string;
  bia_reference?: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

// AI Risk Assessment for creditor/claim
export interface AIRiskAssessment {
  missing_documents: string[];
  late_filing_risk: boolean;
  priority_validation_issues: string[];
  osb_bia_references: string[];
  confidence_score: number;
  recommendations: string[];
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

// Form data for the Add Creditor wizard
export interface AddCreditorFormData {
  // Step 1: Creditor Identity
  name: string;
  creditor_type: CreditorType;
  government_type?: GovernmentCreditorType;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country: string;
  
  // Step 2: Account & Claim Information
  account_number?: string;
  contract_loan_id?: string;
  claim_filed: ClaimFiledStatus;
  claim_amount?: number;
  currency: string;
  claim_date?: string;
  claim_nature?: ClaimNature;
  expected_filing_deadline?: string;
  
  // Priority & Security
  priority: ClaimPriority;
  security_type?: SecurityType;
  collateral_description?: string;
  collateral_value?: number;
  ppsa_registration_number?: string;
  ppsa_province?: string;
  ppsa_registration_date?: string;
  
  // Government & Statutory
  cra_claim_type?: CRAClaimType;
  deemed_trust_applies?: boolean;
  super_priority_applies?: boolean;
  
  // Step 3: Documents
  proof_of_claim_file?: File;
  security_documents?: File[];
  supporting_documents?: File[];
  
  // Notes
  notes?: string;
}
