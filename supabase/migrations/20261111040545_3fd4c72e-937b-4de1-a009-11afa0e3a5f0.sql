ALTER TABLE public.estate_bank_accounts
  ADD COLUMN IF NOT EXISTS account_type text,
  ADD COLUMN IF NOT EXISTS transit_number text,
  ADD COLUMN IF NOT EXISTS superintendent_approval_ref text;

CREATE TABLE public.trust_schedule3_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creditor_name text NOT NULL,
  creditor_reference text,
  consented_on date NOT NULL,
  document_id uuid,
  revoked_on date,
  recorded_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.trust_schedule3_consents TO authenticated;
GRANT ALL ON public.trust_schedule3_consents TO service_role;
ALTER TABLE public.trust_schedule3_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read consents" ON public.trust_schedule3_consents FOR SELECT TO authenticated
  USING (public.get_user_role(auth.uid()) IN ('trustee','admin'));
CREATE POLICY "Staff add consents" ON public.trust_schedule3_consents FOR INSERT TO authenticated
  WITH CHECK (recorded_by = auth.uid() AND public.get_user_role(auth.uid()) IN ('trustee','admin'));
CREATE POLICY "Staff revoke consents" ON public.trust_schedule3_consents FOR UPDATE TO authenticated
  USING (public.get_user_role(auth.uid()) IN ('trustee','admin'));

CREATE OR REPLACE FUNCTION public.trust_consent_revoke_only() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.creditor_name IS DISTINCT FROM OLD.creditor_name OR NEW.consented_on IS DISTINCT FROM OLD.consented_on
     OR NEW.creditor_reference IS DISTINCT FROM OLD.creditor_reference OR NEW.document_id IS DISTINCT FROM OLD.document_id
     OR OLD.revoked_on IS NOT NULL THEN
    RAISE EXCEPTION 'Schedule 3 consents can only be revoked, not edited';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trust_consent_revoke_only BEFORE UPDATE ON public.trust_schedule3_consents FOR EACH ROW EXECUTE FUNCTION public.trust_consent_revoke_only();

CREATE TABLE public.trust_reconciliation_signoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  reconciliation_id uuid REFERENCES public.estate_reconciliations(id),
  statement_date date NOT NULL,
  attestation_type text NOT NULL DEFAULT 'reconciliation',
  intent_statement text NOT NULL,
  content_sha256 text NOT NULL,
  signed_by uuid NOT NULL DEFAULT auth.uid(),
  signed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.trust_reconciliation_signoffs TO authenticated;
GRANT ALL ON public.trust_reconciliation_signoffs TO service_role;
ALTER TABLE public.trust_reconciliation_signoffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Estate staff read signoffs" ON public.trust_reconciliation_signoffs FOR SELECT TO authenticated USING (public.is_estate_staff(estate_id));
CREATE POLICY "Estate staff sign" ON public.trust_reconciliation_signoffs FOR INSERT TO authenticated WITH CHECK (public.is_estate_staff(estate_id) AND signed_by = auth.uid());