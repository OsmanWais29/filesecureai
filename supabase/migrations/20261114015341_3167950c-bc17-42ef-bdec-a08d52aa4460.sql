CREATE TABLE public.estate_assessments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), estate_id uuid NOT NULL REFERENCES public.estates(id), user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id), assessed_on date NOT NULL, assessor text NOT NULL CHECK (length(trim(assessor)) > 0), options_explained text NOT NULL CHECK (length(trim(options_explained)) > 0), recommendation text NOT NULL CHECK (length(trim(recommendation)) > 0), id_verified boolean NOT NULL, prior_insolvency_checked boolean NOT NULL, debtor_acknowledged boolean NOT NULL, evidence_reference text NOT NULL CHECK (length(trim(evidence_reference)) > 0), supervising_lit text NOT NULL CHECK (length(trim(supervising_lit)) > 0), signed_off boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), CHECK (NOT signed_off OR (id_verified AND prior_insolvency_checked AND debtor_acknowledged))
);
GRANT SELECT, INSERT ON public.estate_assessments TO authenticated;
GRANT ALL ON public.estate_assessments TO service_role;
ALTER TABLE public.estate_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY assessment_read ON public.estate_assessments FOR SELECT TO authenticated USING (public.is_estate_staff(estate_id));
CREATE POLICY assessment_record ON public.estate_assessments FOR INSERT TO authenticated WITH CHECK (public.is_estate_staff(estate_id) AND user_id = auth.uid() AND (NOT signed_off OR public.get_user_role(auth.uid()) IN ('trustee','admin')));
CREATE FUNCTION public.audit_estate_assessment() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN
 IF TG_OP <> 'INSERT' THEN RAISE EXCEPTION 'Assessment records are permanent; record a new assessment.'; END IF;
 INSERT INTO public.estate_events (estate_id,user_id,event_type,actor,actor_type,after_state,source) VALUES (NEW.estate_id,NEW.user_id,'assessment.recorded',NEW.user_id::text,'user',to_jsonb(NEW),'assessment_register'); RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.audit_estate_assessment() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER assessment_audit AFTER INSERT ON public.estate_assessments FOR EACH ROW EXECUTE FUNCTION public.audit_estate_assessment();
CREATE TRIGGER assessment_immutable BEFORE UPDATE OR DELETE ON public.estate_assessments FOR EACH ROW EXECUTE FUNCTION public.audit_estate_assessment();