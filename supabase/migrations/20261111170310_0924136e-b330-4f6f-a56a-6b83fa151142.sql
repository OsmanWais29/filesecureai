CREATE TABLE public.estate_trust_settings (
  estate_id uuid PRIMARY KEY REFERENCES public.estates(id) ON DELETE CASCADE,
  account_type text NOT NULL DEFAULT 'individual_estate',
  account_holder text,
  superintendent_approval_ref text,
  superintendent_approval_date date,
  fee_basis text,
  approved_fee_amount numeric(14,2),
  tariff_base numeric(14,2),
  levy_basis numeric(14,2),
  proposal_filed boolean,
  proposal_approved boolean,
  schedule_amount numeric(14,2),
  schedule_frequency text,
  schedule_first_due date,
  schedule_last_due date,
  pooled_coverage_confirmed_by text,
  pooled_coverage_confirmed_on date,
  second_approval_limit numeric(14,2),
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.estate_trust_settings TO authenticated;
GRANT ALL ON public.estate_trust_settings TO service_role;
ALTER TABLE public.estate_trust_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Estate staff manage trust settings" ON public.estate_trust_settings
  FOR ALL TO authenticated USING (public.is_estate_staff(estate_id)) WITH CHECK (public.is_estate_staff(estate_id));

CREATE OR REPLACE FUNCTION public.validate_estate_trust_settings()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.account_type NOT IN ('individual_estate','consolidated_summary','consolidated_proposal') THEN RAISE EXCEPTION 'Unknown account type'; END IF;
  IF NEW.fee_basis IS NOT NULL AND NEW.fee_basis NOT IN ('tariff','court_approved','inspector_approved') THEN RAISE EXCEPTION 'Unknown fee basis'; END IF;
  IF NEW.schedule_frequency IS NOT NULL AND NEW.schedule_frequency NOT IN ('weekly','biweekly','monthly') THEN RAISE EXCEPTION 'Unknown payment frequency'; END IF;
  IF NEW.account_type <> 'individual_estate' AND (coalesce(trim(NEW.superintendent_approval_ref),'') = '' OR NEW.superintendent_approval_date IS NULL) THEN
    RAISE EXCEPTION 'A consolidated account needs the Superintendent approval reference and date';
  END IF;
  IF NEW.schedule_first_due IS NOT NULL AND NEW.schedule_last_due IS NOT NULL AND NEW.schedule_last_due < NEW.schedule_first_due THEN RAISE EXCEPTION 'Last payment date is before the first'; END IF;
  IF coalesce(NEW.approved_fee_amount,0) < 0 OR coalesce(NEW.tariff_base,0) < 0 OR coalesce(NEW.levy_basis,0) < 0 OR coalesce(NEW.schedule_amount,0) < 0 OR coalesce(NEW.second_approval_limit,0) < 0 THEN RAISE EXCEPTION 'Amounts cannot be negative'; END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.validate_estate_trust_settings() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER validate_estate_trust_settings BEFORE INSERT OR UPDATE ON public.estate_trust_settings
  FOR EACH ROW EXECUTE FUNCTION public.validate_estate_trust_settings();