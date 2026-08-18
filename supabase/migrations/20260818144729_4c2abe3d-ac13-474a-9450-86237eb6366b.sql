CREATE TABLE public.estate_payment_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users,
  schedule_type TEXT,
  payment_category TEXT,
  period_type TEXT,
  start_date DATE,
  end_date DATE,
  number_of_periods INTEGER,
  amount_per_payment NUMERIC NOT NULL DEFAULT 0,
  incremental_monthly NUMERIC NOT NULL DEFAULT 0,
  asset_ref TEXT,
  gl_account TEXT,
  pad_enabled BOOLEAN NOT NULL DEFAULT false,
  mandate_reference TEXT,
  first_debit_date DATE,
  grace_period_days INTEGER,
  comments TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_payment_schedules TO authenticated;
GRANT ALL ON public.estate_payment_schedules TO service_role;
ALTER TABLE public.estate_payment_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own payment schedules" ON public.estate_payment_schedules FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_payment_schedules_updated_at BEFORE UPDATE ON public.estate_payment_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.estate_schedule_rows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.estate_payment_schedules(id) ON DELETE CASCADE,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users,
  period_index INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount_due NUMERIC NOT NULL DEFAULT 0,
  amount_received NUMERIC NOT NULL DEFAULT 0,
  amount_deposited NUMERIC NOT NULL DEFAULT 0,
  receipt_id UUID REFERENCES public.estate_receipts(id) ON DELETE SET NULL,
  pad_state TEXT NOT NULL DEFAULT 'pending',
  pad_run_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (schedule_id, period_index)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_schedule_rows TO authenticated;
GRANT ALL ON public.estate_schedule_rows TO service_role;
ALTER TABLE public.estate_schedule_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own schedule rows" ON public.estate_schedule_rows FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_schedule_rows_updated_at BEFORE UPDATE ON public.estate_schedule_rows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.estate_pad_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users,
  bank_account_id UUID REFERENCES public.estate_bank_accounts(id) ON DELETE SET NULL,
  run_date DATE NOT NULL,
  state TEXT NOT NULL DEFAULT 'draft',
  item_count INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  file_format TEXT,
  submitted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_pad_runs TO authenticated;
GRANT ALL ON public.estate_pad_runs TO service_role;
ALTER TABLE public.estate_pad_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own PAD runs" ON public.estate_pad_runs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_pad_runs_updated_at BEFORE UPDATE ON public.estate_pad_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.estate_reconciliations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users,
  bank_account_id UUID REFERENCES public.estate_bank_accounts(id) ON DELETE SET NULL,
  statement_start DATE,
  statement_end DATE,
  opening_statement_balance NUMERIC NOT NULL DEFAULT 0,
  closing_statement_balance NUMERIC NOT NULL DEFAULT 0,
  ledger_balance NUMERIC NOT NULL DEFAULT 0,
  deposits_in_transit NUMERIC NOT NULL DEFAULT 0,
  outstanding_withdrawals NUMERIC NOT NULL DEFAULT 0,
  bank_charges NUMERIC NOT NULL DEFAULT 0,
  interest NUMERIC NOT NULL DEFAULT 0,
  reconciled_balance NUMERIC NOT NULL DEFAULT 0,
  difference NUMERIC NOT NULL DEFAULT 0,
  preparer TEXT,
  reviewer TEXT,
  approval_date DATE,
  status TEXT NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_reconciliations TO authenticated;
GRANT ALL ON public.estate_reconciliations TO service_role;
ALTER TABLE public.estate_reconciliations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own reconciliations" ON public.estate_reconciliations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_reconciliations_updated_at BEFORE UPDATE ON public.estate_reconciliations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.estate_statement_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reconciliation_id UUID NOT NULL REFERENCES public.estate_reconciliations(id) ON DELETE CASCADE,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users,
  line_date DATE,
  description TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  direction TEXT NOT NULL DEFAULT 'credit',
  match_state TEXT NOT NULL DEFAULT 'unmatched',
  matched_receipt_id UUID REFERENCES public.estate_receipts(id) ON DELETE SET NULL,
  matched_disbursement_id UUID REFERENCES public.estate_disbursements(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_statement_lines TO authenticated;
GRANT ALL ON public.estate_statement_lines TO service_role;
ALTER TABLE public.estate_statement_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own statement lines" ON public.estate_statement_lines FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_statement_lines_updated_at BEFORE UPDATE ON public.estate_statement_lines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_schedule_rows_estate ON public.estate_schedule_rows(estate_id, due_date);
CREATE INDEX idx_statement_lines_recon ON public.estate_statement_lines(reconciliation_id);