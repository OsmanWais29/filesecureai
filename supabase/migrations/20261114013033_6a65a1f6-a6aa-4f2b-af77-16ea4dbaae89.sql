CREATE TABLE public.estate_claim_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  creditor_id uuid NOT NULL REFERENCES public.estate_creditors(id) ON DELETE CASCADE,
  decision text NOT NULL,
  admitted_amount numeric NOT NULL DEFAULT 0,
  disallowed_amount numeric NOT NULL DEFAULT 0,
  reason text,
  notice_sent_date date,
  notice_method text,
  decided_by uuid NOT NULL DEFAULT auth.uid(),
  decided_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.estate_claim_decisions TO authenticated;
GRANT ALL ON public.estate_claim_decisions TO service_role;
ALTER TABLE public.estate_claim_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Estate staff read claim decisions" ON public.estate_claim_decisions FOR SELECT TO authenticated USING (public.is_estate_staff(estate_id));
CREATE POLICY "Estate staff add claim decisions" ON public.estate_claim_decisions FOR INSERT TO authenticated WITH CHECK (public.is_estate_staff(estate_id) AND decided_by = auth.uid());

CREATE TABLE public.estate_statutory_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  notice_kind text NOT NULL,
  creditor_id uuid REFERENCES public.estate_creditors(id) ON DELETE SET NULL,
  due_date date,
  sent_date date NOT NULL,
  method text NOT NULL,
  recipients_count integer NOT NULL DEFAULT 0,
  proof_reference text NOT NULL,
  late_reason text,
  recorded_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.estate_statutory_notices TO authenticated;
GRANT ALL ON public.estate_statutory_notices TO service_role;
ALTER TABLE public.estate_statutory_notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Estate staff read notices" ON public.estate_statutory_notices FOR SELECT TO authenticated USING (public.is_estate_staff(estate_id));
CREATE POLICY "Estate staff add notices" ON public.estate_statutory_notices FOR INSERT TO authenticated WITH CHECK (public.is_estate_staff(estate_id) AND recorded_by = auth.uid());

CREATE OR REPLACE FUNCTION public.validate_claim_decision()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.estate_creditors%ROWTYPE;
BEGIN
  SELECT * INTO c FROM public.estate_creditors WHERE id = NEW.creditor_id;
  IF c.id IS NULL OR c.estate_id <> NEW.estate_id THEN RAISE EXCEPTION 'Creditor does not belong to this estate'; END IF;
  IF NEW.decision NOT IN ('admitted','partially_disallowed','disallowed') THEN RAISE EXCEPTION 'Unknown decision'; END IF;
  IF NEW.admitted_amount < 0 OR NEW.disallowed_amount < 0 THEN RAISE EXCEPTION 'Amounts cannot be negative'; END IF;
  IF NEW.decision <> 'admitted' AND (NEW.reason IS NULL OR length(trim(NEW.reason)) < 5) THEN
    RAISE EXCEPTION 'A disallowance needs a written reason (BIA s.135)'; END IF;
  IF NEW.decision = 'disallowed' AND NEW.admitted_amount <> 0 THEN RAISE EXCEPTION 'A full disallowance admits $0'; END IF;
  UPDATE public.estate_creditors SET
    claim_status = CASE NEW.decision WHEN 'admitted' THEN 'Admitted' WHEN 'disallowed' THEN 'Disallowed' ELSE 'Partially disallowed' END,
    admitted_dividend = NEW.admitted_amount, updated_at = now()
  WHERE id = NEW.creditor_id;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.validate_claim_decision() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_validate_claim_decision BEFORE INSERT ON public.estate_claim_decisions FOR EACH ROW EXECUTE FUNCTION public.validate_claim_decision();

CREATE OR REPLACE FUNCTION public.validate_statutory_notice()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.notice_kind NOT IN ('s102_creditor_notice','s66_14_report','s135_disallowance') THEN RAISE EXCEPTION 'Unknown notice kind'; END IF;
  IF length(trim(NEW.proof_reference)) = 0 THEN RAISE EXCEPTION 'Proof of mailing is required'; END IF;
  IF NEW.due_date IS NOT NULL AND NEW.sent_date > NEW.due_date AND (NEW.late_reason IS NULL OR length(trim(NEW.late_reason)) < 5) THEN
    RAISE EXCEPTION 'Late notice needs a reason recorded now'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_validate_statutory_notice BEFORE INSERT ON public.estate_statutory_notices FOR EACH ROW EXECUTE FUNCTION public.validate_statutory_notice();