
-- Drop the incorrectly structured document_analysis table if it exists
DROP TABLE IF EXISTS public.document_analysis CASCADE;

-- Create a properly structured document_analysis table that can handle any form type
CREATE TABLE IF NOT EXISTS public.document_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  form_type TEXT,
  form_number TEXT,
  confidence_score NUMERIC DEFAULT 0.0,
  client_name TEXT,
  estate_number TEXT,
  risk_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a dynamic form tables registry to track AI-created tables
CREATE TABLE IF NOT EXISTS public.dynamic_form_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_number TEXT NOT NULL UNIQUE,
  form_title TEXT NOT NULL,
  table_name TEXT NOT NULL UNIQUE,
  table_schema JSONB NOT NULL,
  created_by_ai BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table to store AI-generated database schemas
CREATE TABLE IF NOT EXISTS public.ai_generated_schemas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_number TEXT NOT NULL,
  schema_definition JSONB NOT NULL,
  sql_creation_script TEXT NOT NULL,
  validation_rules JSONB DEFAULT '{}',
  field_mappings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add proper indexes
CREATE INDEX IF NOT EXISTS idx_document_analysis_document_id ON document_analysis(document_id);
CREATE INDEX IF NOT EXISTS idx_document_analysis_user_id ON document_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_document_analysis_form_type ON document_analysis(form_type);
CREATE INDEX IF NOT EXISTS idx_dynamic_form_tables_form_number ON dynamic_form_tables(form_number);
CREATE INDEX IF NOT EXISTS idx_ai_generated_schemas_form_number ON ai_generated_schemas(form_number);

-- Add RLS policies
ALTER TABLE public.document_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_form_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_schemas ENABLE ROW LEVEL SECURITY;

-- RLS for document_analysis
CREATE POLICY "Users can view their own document analysis" 
  ON public.document_analysis 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own document analysis" 
  ON public.document_analysis 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own document analysis" 
  ON public.document_analysis 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- RLS for dynamic_form_tables (publicly readable for form structure)
CREATE POLICY "Anyone can read form table registry" 
  ON public.dynamic_form_tables 
  FOR SELECT 
  USING (true);

-- RLS for ai_generated_schemas (publicly readable for form schemas)
CREATE POLICY "Anyone can read AI schemas" 
  ON public.ai_generated_schemas 
  FOR SELECT 
  USING (true);

-- Add trigger to update timestamps
CREATE OR REPLACE FUNCTION update_analysis_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_document_analysis_timestamp
  BEFORE UPDATE ON document_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_analysis_timestamp();

CREATE TRIGGER update_dynamic_form_tables_timestamp
  BEFORE UPDATE ON dynamic_form_tables
  FOR EACH ROW
  EXECUTE FUNCTION update_analysis_timestamp();
