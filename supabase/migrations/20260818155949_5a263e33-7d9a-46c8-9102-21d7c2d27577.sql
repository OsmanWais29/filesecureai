CREATE TABLE public.estate_income_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  statement_number INTEGER,
  year INTEGER,
  month TEXT,
  period_label TEXT,
  household_members INTEGER NOT NULL DEFAULT 1,
  income_basis TEXT,
  monthly_income NUMERIC NOT NULL DEFAULT 0,
  discretionary_expenses NUMERIC NOT NULL DEFAULT 0,
  non_discretionary_expenses NUMERIC NOT NULL DEFAULT 0,
  payment NUMERIC NOT NULL DEFAULT 0,
  bankrupt_income NUMERIC NOT NULL DEFAULT 0,
  spouse_income NUMERIC NOT NULL DEFAULT 0,
  other_family_income NUMERIC NOT NULL DEFAULT 0,
  permitted_non_discretionary NUMERIC NOT NULL DEFAULT 0,
  standard_version TEXT,
  threshold_amount NUMERIC NOT NULL DEFAULT 0,
  available_family_income NUMERIC NOT NULL DEFAULT 0,
  bankrupt_portion NUMERIC NOT NULL DEFAULT 0,
  surplus_amount NUMERIC NOT NULL DEFAULT 0,
  required_percentage NUMERIC NOT NULL DEFAULT 0,
  amount_required NUMERIC NOT NULL DEFAULT 0,
  amount_agreed NUMERIC NOT NULL DEFAULT 0,
  payments_made NUMERIC NOT NULL DEFAULT 0,
  outstanding NUMERIC NOT NULL DEFAULT 0,
  disagreement BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Received',
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_income_periods TO authenticated;
GRANT ALL ON public.estate_income_periods TO service_role;
ALTER TABLE public.estate_income_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own income periods" ON public.estate_income_periods FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_income_periods_updated_at BEFORE UPDATE ON public.estate_income_periods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.estate_counselling_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  session_number TEXT,
  appointment_date DATE,
  appointment_time TEXT,
  location TEXT,
  counsellor TEXT,
  third_party_firm TEXT,
  address TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  date_invoiced DATE,
  refused BOOLEAN NOT NULL DEFAULT false,
  neglected BOOLEAN NOT NULL DEFAULT false,
  details TEXT,
  comments TEXT,
  source_document TEXT,
  certificate_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_counselling_sessions TO authenticated;
GRANT ALL ON public.estate_counselling_sessions TO service_role;
ALTER TABLE public.estate_counselling_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own counselling sessions" ON public.estate_counselling_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_counselling_sessions_updated_at BEFORE UPDATE ON public.estate_counselling_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.estate_tax_returns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  return_type TEXT,
  year INTEGER,
  jurisdiction TEXT,
  source TEXT,
  status TEXT,
  date_filed DATE,
  assessment_date DATE,
  follow_up_months INTEGER,
  reminder_date DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  estimated_amount NUMERIC NOT NULL DEFAULT 0,
  amount_deposited NUMERIC NOT NULL DEFAULT 0,
  disposition TEXT,
  disposition_date DATE,
  preparer_name TEXT,
  date_forwarded DATE,
  date_prepared DATE,
  date_paid DATE,
  preparation_charge NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_tax_returns TO authenticated;
GRANT ALL ON public.estate_tax_returns TO service_role;
ALTER TABLE public.estate_tax_returns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tax returns" ON public.estate_tax_returns FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_tax_returns_updated_at BEFORE UPDATE ON public.estate_tax_returns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.estate_tax_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  doc_type TEXT,
  tax_year INTEGER,
  required BOOLEAN NOT NULL DEFAULT true,
  received BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false,
  linked_document TEXT,
  requested_date DATE,
  received_date DATE,
  reminder_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_tax_documents TO authenticated;
GRANT ALL ON public.estate_tax_documents TO service_role;
ALTER TABLE public.estate_tax_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tax documents" ON public.estate_tax_documents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_tax_documents_updated_at BEFORE UPDATE ON public.estate_tax_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();