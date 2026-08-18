
-- Phase 2: milestone engine
CREATE TABLE public.estate_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  stage TEXT NOT NULL,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'pending',
  anchor_date_type TEXT,
  offset_days INTEGER,
  due_date DATE,
  completed_date DATE,
  blocking BOOLEAN NOT NULL DEFAULT false,
  statutory_reference TEXT,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (estate_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_milestones TO authenticated;
GRANT ALL ON public.estate_milestones TO service_role;
ALTER TABLE public.estate_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own estate milestones" ON public.estate_milestones FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER estate_milestones_updated BEFORE UPDATE ON public.estate_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 3: trust accounting
CREATE TABLE public.estate_bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  institution TEXT,
  branch TEXT,
  transit_number TEXT,
  account_number TEXT,
  account_type TEXT,
  currency TEXT NOT NULL DEFAULT 'CAD',
  is_default BOOLEAN NOT NULL DEFAULT false,
  opened_date DATE,
  as_of_date DATE,
  closed_date DATE,
  opening_balance NUMERIC NOT NULL DEFAULT 0,
  gl_bank_account TEXT,
  export_format TEXT,
  pad_enabled BOOLEAN NOT NULL DEFAULT false,
  eft_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_bank_accounts TO authenticated;
GRANT ALL ON public.estate_bank_accounts TO service_role;
ALTER TABLE public.estate_bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own estate bank accounts" ON public.estate_bank_accounts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER estate_bank_accounts_updated BEFORE UPDATE ON public.estate_bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.estate_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  bank_account_id UUID REFERENCES public.estate_bank_accounts(id) ON DELETE SET NULL,
  receipt_date DATE,
  received_from TEXT,
  payment_method TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  reference TEXT,
  receipt_number TEXT,
  deposit_date DATE,
  memo TEXT,
  posted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_receipts TO authenticated;
GRANT ALL ON public.estate_receipts TO service_role;
ALTER TABLE public.estate_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own estate receipts" ON public.estate_receipts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER estate_receipts_updated BEFORE UPDATE ON public.estate_receipts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.estate_receipt_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_id UUID NOT NULL REFERENCES public.estate_receipts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  gl_account TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  creditor_ref TEXT,
  asset_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_receipt_allocations TO authenticated;
GRANT ALL ON public.estate_receipt_allocations TO service_role;
ALTER TABLE public.estate_receipt_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own receipt allocations" ON public.estate_receipt_allocations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.estate_disbursements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  bank_account_id UUID REFERENCES public.estate_bank_accounts(id) ON DELETE SET NULL,
  disbursement_type TEXT,
  due_date DATE,
  payee TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  gl_account TEXT,
  asset_ref TEXT,
  creditor_ref TEXT,
  tax_treatment TEXT,
  payment_method TEXT,
  payment_date DATE,
  cleared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_disbursements TO authenticated;
GRANT ALL ON public.estate_disbursements TO service_role;
ALTER TABLE public.estate_disbursements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own estate disbursements" ON public.estate_disbursements FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER estate_disbursements_updated BEFORE UPDATE ON public.estate_disbursements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.estate_ledger_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  gl_date DATE,
  bank_account_id UUID REFERENCES public.estate_bank_accounts(id) ON DELETE SET NULL,
  memo TEXT,
  source_type TEXT NOT NULL DEFAULT 'journal',
  source_id UUID,
  reversal_of UUID REFERENCES public.estate_ledger_entries(id) ON DELETE SET NULL,
  lines JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_debit NUMERIC NOT NULL DEFAULT 0,
  total_credit NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_ledger_entries TO authenticated;
GRANT ALL ON public.estate_ledger_entries TO service_role;
ALTER TABLE public.estate_ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own estate ledger entries" ON public.estate_ledger_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
