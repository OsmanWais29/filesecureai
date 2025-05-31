
// OSB TypeScript Interfaces for Enhanced Analysis System
// Complete type definitions for DeepSeek AI form analysis

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface DeepSeekAnalysisResponse {
  document_details: DocumentDetails;
  form_summary: FormSummary;
  client_details: ClientDetails;
  comprehensive_risk_assessment: RiskAssessment;
}

export interface DocumentDetails {
  form_number: string;
  form_title: string;
  document_type: string;
  processing_status: 'complete' | 'partial' | 'failed';
  confidence_score: number; // 0-100
  pages_analyzed: number;
  extraction_quality: 'high' | 'medium' | 'low';
}

export interface FormSummary {
  purpose: string;
  filing_deadline: string | null;
  required_attachments: string[];
  key_parties: string[];
  status: 'complete' | 'incomplete' | 'needs_review';
}

export interface ClientDetails {
  debtor_name: string | null;
  debtor_address: string | null;
  trustee_name: string | null;
  creditor_name: string | null;
  estate_number: string | null;
  court_district: string | null;
  extracted_dates: ExtractedDates;
}

export interface ExtractedDates {
  filing_date: string | null;
  bankruptcy_date: string | null;
  signature_date: string | null;
}

export interface RiskAssessment {
  overall_risk_level: 'low' | 'medium' | 'high';
  compliance_status: ComplianceStatus;
  identified_risks: IdentifiedRisk[];
  validation_flags: ValidationFlags;
}

export interface ComplianceStatus {
  bia_compliant: boolean;
  osb_compliant: boolean;
  missing_requirements: string[];
}

export interface IdentifiedRisk {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  regulation_reference: string;
  suggested_action: string;
  deadline_impact: boolean;
}

export interface ValidationFlags {
  signature_verified: boolean;
  dates_consistent: boolean;
  amounts_reasonable: boolean;
  required_fields_complete: boolean;
}

// ============================================================================
// DATABASE INTERFACES
// ============================================================================

export interface OSBFormAnalysis {
  id: string;
  form_number: string;
  form_title: string;
  document_type: string;
  processing_status: 'complete' | 'partial' | 'failed';
  confidence_score: number;
  pages_analyzed: number;
  extraction_quality: 'high' | 'medium' | 'low';
  
  // Client Details
  debtor_name?: string;
  debtor_address?: string;
  trustee_name?: string;
  creditor_name?: string;
  estate_number?: string;
  court_district?: string;
  
  // Dates
  filing_date?: Date;
  bankruptcy_date?: Date;
  signature_date?: Date;
  
  // Risk Assessment
  overall_risk_level: 'low' | 'medium' | 'high';
  bia_compliant: boolean;
  osb_compliant: boolean;
  signature_verified: boolean;
  dates_consistent: boolean;
  amounts_reasonable: boolean;
  required_fields_complete: boolean;
  
  // JSON Fields
  analysis_result: DeepSeekAnalysisResponse;
  compliance_status: ComplianceStatus;
  identified_risks: IdentifiedRisk[];
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  analyzed_by: string;
}

export interface OSBFormReference {
  form_number: string;
  form_title: string;
  category: string;
  risk_level: 'low' | 'medium' | 'high';
  required_fields: string[];
  filing_deadlines: string[];
  bia_references: string[];
  required_attachments: string[];
  validation_rules: string;
  is_active: boolean;
  created_at: Date;
}

export interface OSBFormConfig {
  formNumber: string;
  formTitle: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiredFields: string[];
  deadlines: string[];
  biaReferences: string[];
  attachments: string[];
}
