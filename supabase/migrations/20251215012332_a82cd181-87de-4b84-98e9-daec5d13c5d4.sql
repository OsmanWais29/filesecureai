-- Create creditors table
CREATE TABLE public.creditors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  estate_id UUID,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Canada',
  email TEXT,
  phone TEXT,
  fax TEXT,
  creditor_type TEXT NOT NULL DEFAULT 'other',
  account_number TEXT,
  contact_person TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create claims table
CREATE TABLE public.claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creditor_id UUID REFERENCES public.creditors(id) ON DELETE CASCADE,
  estate_id UUID,
  user_id UUID REFERENCES auth.users(id),
  claim_amount NUMERIC NOT NULL DEFAULT 0,
  secured_amount NUMERIC DEFAULT 0,
  preferred_amount NUMERIC DEFAULT 0,
  unsecured_amount NUMERIC DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'unsecured',
  status TEXT NOT NULL DEFAULT 'pending',
  filing_date DATE DEFAULT CURRENT_DATE,
  is_late_filing BOOLEAN DEFAULT false,
  collateral_description TEXT,
  collateral_value NUMERIC,
  supporting_documents JSONB DEFAULT '[]'::jsonb,
  proof_of_claim_doc_id UUID,
  osb_compliant BOOLEAN DEFAULT false,
  validation_notes TEXT,
  ai_flags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create creditor_notices table
CREATE TABLE public.creditor_notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creditor_id UUID REFERENCES public.creditors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  notice_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_via TEXT DEFAULT 'email',
  read_at TIMESTAMP WITH TIME ZONE,
  delivery_status TEXT DEFAULT 'pending',
  document_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create creditor_meetings table
CREATE TABLE public.creditor_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID,
  user_id UUID REFERENCES auth.users(id),
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL,
  location TEXT,
  meeting_type TEXT NOT NULL DEFAULT 'first',
  status TEXT NOT NULL DEFAULT 'scheduled',
  quorum_met BOOLEAN DEFAULT false,
  total_eligible_voters INTEGER DEFAULT 0,
  total_votes_cast INTEGER DEFAULT 0,
  total_claim_amount_voting NUMERIC DEFAULT 0,
  agenda TEXT,
  minutes TEXT,
  votes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create distributions table
CREATE TABLE public.distributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID,
  user_id UUID REFERENCES auth.users(id),
  distribution_date DATE DEFAULT CURRENT_DATE,
  total_receipts NUMERIC DEFAULT 0,
  total_disbursements NUMERIC DEFAULT 0,
  trustee_fees NUMERIC DEFAULT 0,
  levy_amount NUMERIC DEFAULT 0,
  sales_tax NUMERIC DEFAULT 0,
  secured_distribution NUMERIC DEFAULT 0,
  preferred_distribution NUMERIC DEFAULT 0,
  unsecured_distribution NUMERIC DEFAULT 0,
  dividend_rate NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  distributions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create estates table
CREATE TABLE public.estates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID,
  user_id UUID REFERENCES auth.users(id),
  debtor_name TEXT NOT NULL,
  file_number TEXT,
  estate_type TEXT NOT NULL DEFAULT 'bankruptcy',
  status TEXT NOT NULL DEFAULT 'open',
  trustee_id UUID,
  trustee_name TEXT,
  assigned_date DATE DEFAULT CURRENT_DATE,
  trust_balance NUMERIC DEFAULT 0,
  total_creditors INTEGER DEFAULT 0,
  total_claims NUMERIC DEFAULT 0,
  next_deadline DATE,
  next_deadline_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.creditors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creditor_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creditor_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creditors
CREATE POLICY "Users can view their own creditors" ON public.creditors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own creditors" ON public.creditors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creditors" ON public.creditors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own creditors" ON public.creditors
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for claims
CREATE POLICY "Users can view their own claims" ON public.claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own claims" ON public.claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own claims" ON public.claims
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own claims" ON public.claims
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for creditor_notices
CREATE POLICY "Users can view their own notices" ON public.creditor_notices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notices" ON public.creditor_notices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notices" ON public.creditor_notices
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for creditor_meetings
CREATE POLICY "Users can view their own meetings" ON public.creditor_meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meetings" ON public.creditor_meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meetings" ON public.creditor_meetings
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for distributions
CREATE POLICY "Users can view their own distributions" ON public.distributions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own distributions" ON public.distributions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own distributions" ON public.distributions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for estates
CREATE POLICY "Users can view their own estates" ON public.estates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own estates" ON public.estates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own estates" ON public.estates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own estates" ON public.estates
  FOR DELETE USING (auth.uid() = user_id);

-- Create update_updated_at function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_creditors_updated_at BEFORE UPDATE ON public.creditors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON public.claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creditor_meetings_updated_at BEFORE UPDATE ON public.creditor_meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_distributions_updated_at BEFORE UPDATE ON public.distributions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estates_updated_at BEFORE UPDATE ON public.estates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();