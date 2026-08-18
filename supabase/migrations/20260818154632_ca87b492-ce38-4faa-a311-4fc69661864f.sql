
CREATE TABLE public.estate_creditors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  master_creditor text,
  legal_name text NOT NULL,
  account_number text,
  head_office boolean NOT NULL DEFAULT false,
  address1 text, address2 text, city text, province text, postal_code text, country text,
  phone text, email text,
  creditor_type text,
  soa_amount numeric NOT NULL DEFAULT 0,
  contingent_amount numeric NOT NULL DEFAULT 0,
  deferred_amount numeric NOT NULL DEFAULT 0,
  other_amount numeric NOT NULL DEFAULT 0,
  poc_filed boolean NOT NULL DEFAULT false,
  received_date date,
  claim_status text,
  filed_amount numeric NOT NULL DEFAULT 0,
  admitted_voting numeric NOT NULL DEFAULT 0,
  admitted_dividend numeric NOT NULL DEFAULT 0,
  claim_class text,
  rank integer,
  reasons text,
  completed boolean NOT NULL DEFAULT false,
  meeting_requested boolean NOT NULL DEFAULT false,
  report_170_requested boolean NOT NULL DEFAULT false,
  material_change_requested boolean NOT NULL DEFAULT false,
  amended_payments_requested boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_creditors TO authenticated;
GRANT ALL ON public.estate_creditors TO service_role;
ALTER TABLE public.estate_creditors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage estate creditors" ON public.estate_creditors FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER estate_creditors_updated BEFORE UPDATE ON public.estate_creditors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_estate_creditors_estate ON public.estate_creditors(estate_id);

CREATE TABLE public.estate_creditor_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  voting_round integer,
  notice_sent_date date,
  meeting_date date,
  meeting_time text,
  location text,
  chairperson text,
  amendment_made_by text,
  deemed_approval boolean NOT NULL DEFAULT false,
  deemed_approval_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_creditor_meetings TO authenticated;
GRANT ALL ON public.estate_creditor_meetings TO service_role;
ALTER TABLE public.estate_creditor_meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage estate creditor meetings" ON public.estate_creditor_meetings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER estate_creditor_meetings_updated BEFORE UPDATE ON public.estate_creditor_meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_estate_creditor_meetings_estate ON public.estate_creditor_meetings(estate_id);

CREATE TABLE public.estate_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  asset_type text,
  description text NOT NULL,
  soa_value numeric NOT NULL DEFAULT 0,
  original_cost numeric NOT NULL DEFAULT 0,
  soa_unlocked boolean NOT NULL DEFAULT false,
  estimated numeric NOT NULL DEFAULT 0,
  amount_to_realize numeric NOT NULL DEFAULT 0,
  amount_deposited numeric NOT NULL DEFAULT 0,
  disposition text,
  disposition_date date,
  completed boolean NOT NULL DEFAULT false,
  exempt boolean NOT NULL DEFAULT false,
  exemption_status text,
  buy_back boolean NOT NULL DEFAULT false,
  not_sold boolean NOT NULL DEFAULT false,
  not_sold_reason text,
  rd_notes text,
  print_on_rd boolean NOT NULL DEFAULT false,
  encumbered boolean NOT NULL DEFAULT false,
  selling_costs numeric NOT NULL DEFAULT 0,
  exempt_amount numeric NOT NULL DEFAULT 0,
  third_party_interest numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_assets TO authenticated;
GRANT ALL ON public.estate_assets TO service_role;
ALTER TABLE public.estate_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage estate assets" ON public.estate_assets FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER estate_assets_updated BEFORE UPDATE ON public.estate_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_estate_assets_estate ON public.estate_assets(estate_id);

CREATE TABLE public.estate_asset_securities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES public.estate_assets(id) ON DELETE CASCADE,
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  creditor_id uuid REFERENCES public.estate_creditors(id) ON DELETE SET NULL,
  creditor_name text,
  rank integer NOT NULL DEFAULT 1,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_asset_securities TO authenticated;
GRANT ALL ON public.estate_asset_securities TO service_role;
ALTER TABLE public.estate_asset_securities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage estate asset securities" ON public.estate_asset_securities FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_estate_asset_securities_asset ON public.estate_asset_securities(asset_id);
