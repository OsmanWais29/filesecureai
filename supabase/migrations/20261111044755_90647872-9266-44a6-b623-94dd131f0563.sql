
CREATE TABLE public.osb_schema_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_number text NOT NULL,
  version_label text NOT NULL,
  namespace text,
  source_url text,
  xsd_sha256 text,
  effective_from date,
  notes text,
  loaded_by uuid,
  loaded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (form_number, version_label)
);
CREATE TABLE public.osb_schema_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schema_version_id uuid NOT NULL REFERENCES public.osb_schema_versions(id) ON DELETE CASCADE,
  path text NOT NULL,
  seq integer NOT NULL,
  data_type text,
  min_occurs integer NOT NULL DEFAULT 1,
  max_occurs integer,
  choice_group text,
  enum_values jsonb,
  UNIQUE (schema_version_id, path)
);
CREATE TABLE public.osb_field_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schema_element_id uuid NOT NULL REFERENCES public.osb_schema_elements(id) ON DELETE CASCADE,
  source_field text NOT NULL,
  transform text,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (schema_element_id)
);
CREATE TABLE public.osb_filings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  form_number text NOT NULL,
  version_label text NOT NULL,
  status text NOT NULL DEFAULT 'drafted',
  amends_filing_id uuid REFERENCES public.osb_filings(id),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  xml text,
  xml_sha256 text,
  readiness jsonb NOT NULL DEFAULT '{}'::jsonb,
  signed_by uuid,
  signed_at timestamptz,
  osb_reference text,
  osb_response jsonb,
  responded_at timestamptz,
  deadline date,
  deadline_outcome text,
  late_reason text,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.osb_filing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id uuid NOT NULL REFERENCES public.osb_filings(id) ON DELETE CASCADE,
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  detail text,
  actor uuid DEFAULT auth.uid(),
  at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.osb_evidence_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id uuid NOT NULL UNIQUE REFERENCES public.osb_filings(id) ON DELETE CASCADE,
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  pack jsonb NOT NULL,
  pack_sha256 text NOT NULL,
  document_id uuid,
  sealed_by uuid DEFAULT auth.uid(),
  sealed_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.osb_schema_versions, public.osb_schema_elements, public.osb_field_mappings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.osb_schema_versions, public.osb_schema_elements, public.osb_field_mappings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.osb_filings TO authenticated;
GRANT SELECT, INSERT ON public.osb_filing_events, public.osb_evidence_packs TO authenticated;
GRANT ALL ON public.osb_schema_versions, public.osb_schema_elements, public.osb_field_mappings, public.osb_filings, public.osb_filing_events, public.osb_evidence_packs TO service_role;

ALTER TABLE public.osb_schema_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.osb_schema_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.osb_field_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.osb_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.osb_filing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.osb_evidence_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users read schemas" ON public.osb_schema_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage schemas" ON public.osb_schema_versions FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'admin') WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Signed-in users read schema elements" ON public.osb_schema_elements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage schema elements" ON public.osb_schema_elements FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'admin') WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Signed-in users read mappings" ON public.osb_field_mappings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage mappings" ON public.osb_field_mappings FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'admin') WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Estate staff read filings" ON public.osb_filings FOR SELECT TO authenticated USING (public.is_estate_staff(estate_id));
CREATE POLICY "Estate staff create filings" ON public.osb_filings FOR INSERT TO authenticated WITH CHECK (public.is_estate_staff(estate_id));
CREATE POLICY "Estate staff update filings" ON public.osb_filings FOR UPDATE TO authenticated USING (public.is_estate_staff(estate_id)) WITH CHECK (public.is_estate_staff(estate_id));
CREATE POLICY "Estate staff read filing events" ON public.osb_filing_events FOR SELECT TO authenticated USING (public.is_estate_staff(estate_id));
CREATE POLICY "Estate staff append filing events" ON public.osb_filing_events FOR INSERT TO authenticated WITH CHECK (public.is_estate_staff(estate_id));
CREATE POLICY "Estate staff read evidence" ON public.osb_evidence_packs FOR SELECT TO authenticated USING (public.is_estate_staff(estate_id));
CREATE POLICY "Estate staff seal evidence" ON public.osb_evidence_packs FOR INSERT TO authenticated WITH CHECK (public.is_estate_staff(estate_id));

-- Status flow: forward only; OSB outcomes need a recorded OSB reference; sealed content cannot change.
CREATE OR REPLACE FUNCTION public.osb_filing_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE ord text[] := ARRAY['drafted','checked','signed','queued','submitted','acknowledged','accepted'];
  a int; b int;
BEGIN
  NEW.updated_at := now();
  IF NEW.status NOT IN ('drafted','checked','signed','queued','submitted','acknowledged','accepted','rejected') THEN
    RAISE EXCEPTION 'Unknown filing status %', NEW.status;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.estate_id <> OLD.estate_id OR NEW.form_number <> OLD.form_number OR NEW.version_label <> OLD.version_label THEN
      RAISE EXCEPTION 'Filing identity cannot change';
    END IF;
    IF OLD.status IN ('accepted','rejected') AND NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'Closed filings cannot change status; create an amendment';
    END IF;
    IF OLD.signed_at IS NOT NULL AND (NEW.xml IS DISTINCT FROM OLD.xml OR NEW.payload IS DISTINCT FROM OLD.payload) THEN
      RAISE EXCEPTION 'Signed filing content is sealed; create an amendment';
    END IF;
    a := array_position(ord, OLD.status); b := array_position(ord, NEW.status);
    IF NEW.status <> 'rejected' AND b < a THEN RAISE EXCEPTION 'Filing status cannot move backwards'; END IF;
    IF NEW.status = 'drafted' AND OLD.status = 'checked' THEN NULL; END IF;
  END IF;
  IF NEW.status IN ('acknowledged','accepted','rejected') AND coalesce(trim(NEW.osb_reference),'') = '' THEN
    RAISE EXCEPTION 'An OSB reference is required to record an OSB response';
  END IF;
  IF NEW.status IN ('signed','queued','submitted','acknowledged','accepted') AND NEW.signed_at IS NULL THEN
    RAISE EXCEPTION 'Filing must be signed first';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER osb_filing_guard BEFORE INSERT OR UPDATE ON public.osb_filings FOR EACH ROW EXECUTE FUNCTION public.osb_filing_guard();

CREATE OR REPLACE FUNCTION public.osb_immutable_row()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN RAISE EXCEPTION '% rows are append-only', TG_TABLE_NAME; END $$;
CREATE TRIGGER osb_filing_events_immutable BEFORE UPDATE OR DELETE ON public.osb_filing_events FOR EACH ROW EXECUTE FUNCTION public.osb_immutable_row();
CREATE TRIGGER osb_evidence_immutable BEFORE UPDATE OR DELETE ON public.osb_evidence_packs FOR EACH ROW EXECUTE FUNCTION public.osb_immutable_row();
REVOKE EXECUTE ON FUNCTION public.osb_filing_guard() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.osb_immutable_row() FROM anon, authenticated, public;
