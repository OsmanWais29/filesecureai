
export interface DeepSeekAnalysisResponse {
  form_number: string;
  form_title: string;
  document_type: string;
  overall_risk_level: 'low' | 'medium' | 'high';
  confidence_score: number;
  analysis_result: any;
  identified_risks: IdentifiedRisk[];
  compliance_status: any;
}

export interface IdentifiedRisk {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  risk_type: string;
  suggested_action: string;
  regulation_reference?: string;
  deadline_impact: boolean;
}

export interface OSBFormAnalysis {
  id: string;
  form_number: string;
  form_title: string;
  document_type: string;
  processing_status: string;
  overall_risk_level: 'low' | 'medium' | 'high';
  confidence_score: number;
  extraction_quality: string;
  required_fields_complete: boolean;
  signature_verified: boolean;
  dates_consistent: boolean;
  amounts_reasonable: boolean;
  bia_compliant: boolean;
  osb_compliant: boolean;
  debtor_name?: string;
  debtor_address?: string;
  trustee_name?: string;
  creditor_name?: string;
  estate_number?: string;
  court_district?: string;
  filing_date?: string;
  bankruptcy_date?: string;
  signature_date?: string;
  pages_analyzed: number;
  analysis_result: any;
  identified_risks?: IdentifiedRisk[];
  compliance_status?: any;
  analyzed_by?: string;
  created_at: string;
  updated_at: string;
}
