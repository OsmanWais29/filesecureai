
-- Create enhanced document analysis tables for Phase 2
CREATE TABLE IF NOT EXISTS public.ai_document_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  analysis_type VARCHAR(50) NOT NULL DEFAULT 'form_detection',
  confidence_score DECIMAL(5,4) NOT NULL DEFAULT 0.0,
  extracted_data JSONB NOT NULL DEFAULT '{}',
  identified_form_type VARCHAR(100),
  client_name_extracted VARCHAR(255),
  form_number VARCHAR(20),
  risk_flags JSONB DEFAULT '[]',
  processing_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  error_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create BIA forms reference table for validation
CREATE TABLE IF NOT EXISTS public.bia_forms_reference (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_number VARCHAR(20) NOT NULL UNIQUE,
  form_title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  required_fields JSONB NOT NULL DEFAULT '[]',
  validation_rules JSONB NOT NULL DEFAULT '{}',
  risk_indicators JSONB NOT NULL DEFAULT '[]',
  filing_deadlines JSONB NOT NULL DEFAULT '{}',
  bia_section_references JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create document auto-categorization results table
CREATE TABLE IF NOT EXISTS public.document_categorization (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  suggested_client_folder VARCHAR(255),
  suggested_form_category VARCHAR(100),
  confidence_level VARCHAR(20) NOT NULL DEFAULT 'medium',
  categorization_reasoning TEXT,
  auto_applied BOOLEAN NOT NULL DEFAULT false,
  user_approved BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert sample BIA forms data
INSERT INTO public.bia_forms_reference (form_number, form_title, category, required_fields, validation_rules, risk_indicators) VALUES
('47', 'Consumer Proposal', 'debt_restructuring', 
 '["debtor_name", "debtor_address", "proposal_terms", "creditor_list", "administrator_signature"]',
 '{"debtor_name": {"required": true, "type": "string"}, "proposal_terms": {"required": true, "min_length": 50}}',
 '["missing_creditor_information", "unrealistic_payment_terms", "incomplete_asset_disclosure"]'),
('76', 'Statement of Affairs', 'bankruptcy_filing',
 '["debtor_personal_info", "asset_listing", "liability_listing", "income_statement", "trustee_info"]',
 '{"asset_total": {"required": true, "type": "number", "min": 0}, "liability_total": {"required": true, "type": "number"}}',
 '["asset_undervaluation", "hidden_liabilities", "income_discrepancies"]'),
('31', 'Proof of Income and Expenses', 'financial_reporting',
 '["monthly_income", "employment_details", "expense_breakdown", "supporting_documents"]',
 '{"monthly_income": {"required": true, "type": "number", "min": 0}, "total_expenses": {"required": true, "type": "number"}}',
 '["income_expense_mismatch", "missing_documentation", "unreported_income"]');

-- Enable RLS on new tables
ALTER TABLE public.ai_document_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bia_forms_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_categorization ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_document_analysis
CREATE POLICY "Users can view their own document analysis" 
  ON public.ai_document_analysis FOR SELECT 
  USING (
    document_id IN (
      SELECT id FROM public.documents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create analysis for their documents" 
  ON public.ai_document_analysis FOR INSERT 
  WITH CHECK (
    document_id IN (
      SELECT id FROM public.documents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their document analysis" 
  ON public.ai_document_analysis FOR UPDATE 
  USING (
    document_id IN (
      SELECT id FROM public.documents WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for bia_forms_reference (public read access)
CREATE POLICY "Anyone can read BIA forms reference" 
  ON public.bia_forms_reference FOR SELECT 
  USING (true);

-- Create RLS policies for document_categorization
CREATE POLICY "Users can view their own categorization" 
  ON public.document_categorization FOR SELECT 
  USING (
    document_id IN (
      SELECT id FROM public.documents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create categorization for their documents" 
  ON public.document_categorization FOR INSERT 
  WITH CHECK (
    document_id IN (
      SELECT id FROM public.documents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their categorization" 
  ON public.document_categorization FOR UPDATE 
  USING (
    document_id IN (
      SELECT id FROM public.documents WHERE user_id = auth.uid()
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_analysis_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_ai_analysis_timestamp
  BEFORE UPDATE ON public.ai_document_analysis
  FOR EACH ROW EXECUTE FUNCTION update_analysis_timestamp();

CREATE TRIGGER update_categorization_timestamp
  BEFORE UPDATE ON public.document_categorization
  FOR EACH ROW EXECUTE FUNCTION update_analysis_timestamp();

-- Create indexes for better performance
CREATE INDEX idx_ai_analysis_document_id ON public.ai_document_analysis(document_id);
CREATE INDEX idx_ai_analysis_form_type ON public.ai_document_analysis(identified_form_type);
CREATE INDEX idx_categorization_document_id ON public.document_categorization(document_id);
CREATE INDEX idx_bia_forms_number ON public.bia_forms_reference(form_number);
