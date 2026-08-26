-- ============ helper: staff access to an estate ============
CREATE OR REPLACE FUNCTION public.is_estate_staff(_estate_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.estates e
      WHERE e.id = _estate_id
        AND (e.user_id = auth.uid() OR e.trustee_id = auth.uid())
    )
    OR public.get_user_role(auth.uid()) IN ('trustee','admin')
  );
$$;

-- ============ requests ============
CREATE TABLE public.client_portal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  client_user_id uuid,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  request_type text NOT NULL DEFAULT 'other',
  requested_document_type text,
  source_document_id uuid,
  source_signal_id text,
  due_date date,
  priority text NOT NULL DEFAULT 'Standard',
  status text NOT NULL DEFAULT 'Action Required',
  client_response text,
  trustee_review_state text NOT NULL DEFAULT 'Not started',
  review_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  reopened_count integer NOT NULL DEFAULT 0,
  requested_by uuid,
  requested_by_name text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cpr_estate ON public.client_portal_requests(estate_id, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_requests TO authenticated;
GRANT ALL ON public.client_portal_requests TO service_role;
ALTER TABLE public.client_portal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff manage requests" ON public.client_portal_requests
  FOR ALL TO authenticated
  USING (public.is_estate_staff(estate_id))
  WITH CHECK (public.is_estate_staff(estate_id));

CREATE POLICY "client reads own estate requests" ON public.client_portal_requests
  FOR SELECT TO authenticated
  USING (public.has_portal_access(auth.uid(), estate_id));

CREATE POLICY "client responds to requests" ON public.client_portal_requests
  FOR UPDATE TO authenticated
  USING (public.has_portal_access(auth.uid(), estate_id))
  WITH CHECK (
    public.has_portal_access(auth.uid(), estate_id)
    AND status IN ('In Progress','Submitted')
  );

CREATE TRIGGER trg_cpr_updated BEFORE UPDATE ON public.client_portal_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- staff-only internal notes (column-level isolation via separate table)
CREATE TABLE public.client_portal_request_staff_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.client_portal_requests(id) ON DELETE CASCADE,
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  note text NOT NULL,
  author_id uuid,
  author_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_request_staff_notes TO authenticated;
GRANT ALL ON public.client_portal_request_staff_notes TO service_role;
ALTER TABLE public.client_portal_request_staff_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff only notes" ON public.client_portal_request_staff_notes
  FOR ALL TO authenticated
  USING (public.is_estate_staff(estate_id))
  WITH CHECK (public.is_estate_staff(estate_id));
CREATE TRIGGER trg_cprsn_updated BEFORE UPDATE ON public.client_portal_request_staff_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ documents ============
CREATE TABLE public.client_portal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  request_id uuid REFERENCES public.client_portal_requests(id) ON DELETE SET NULL,
  title text NOT NULL,
  doc_category text,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  content_hash text,
  page_count integer,
  source text NOT NULL DEFAULT 'CLIENT_UPLOAD',
  uploaded_by uuid,
  uploaded_by_name text,
  uploaded_by_role text NOT NULL DEFAULT 'client',
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  supersedes_id uuid REFERENCES public.client_portal_documents(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1,
  review_state text NOT NULL DEFAULT 'Received',
  review_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cpd_estate ON public.client_portal_documents(estate_id, uploaded_at DESC);
CREATE INDEX idx_cpd_request ON public.client_portal_documents(request_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_documents TO authenticated;
GRANT ALL ON public.client_portal_documents TO service_role;
ALTER TABLE public.client_portal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff manage portal documents" ON public.client_portal_documents
  FOR ALL TO authenticated
  USING (public.is_estate_staff(estate_id))
  WITH CHECK (public.is_estate_staff(estate_id));
CREATE POLICY "client reads portal documents" ON public.client_portal_documents
  FOR SELECT TO authenticated
  USING (public.has_portal_access(auth.uid(), estate_id));
CREATE POLICY "client uploads portal documents" ON public.client_portal_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_portal_access(auth.uid(), estate_id)
    AND uploaded_by = auth.uid()
    AND uploaded_by_role = 'client'
    AND review_state = 'Received'
  );
CREATE TRIGGER trg_cpd_updated BEFORE UPDATE ON public.client_portal_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ guided intake (My Information) ============
CREATE TABLE public.client_portal_intake_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  status text NOT NULL DEFAULT 'not_started',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_saved_at timestamptz,
  submitted_at timestamptz,
  submitted_by uuid,
  review_state text NOT NULL DEFAULT 'Not started',
  review_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (estate_id, section_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_intake_sections TO authenticated;
GRANT ALL ON public.client_portal_intake_sections TO service_role;
ALTER TABLE public.client_portal_intake_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff manage intake" ON public.client_portal_intake_sections
  FOR ALL TO authenticated
  USING (public.is_estate_staff(estate_id))
  WITH CHECK (public.is_estate_staff(estate_id));
CREATE POLICY "client reads intake" ON public.client_portal_intake_sections
  FOR SELECT TO authenticated
  USING (public.has_portal_access(auth.uid(), estate_id));
CREATE POLICY "client creates intake" ON public.client_portal_intake_sections
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_portal_access(auth.uid(), estate_id)
    AND status IN ('draft','submitted')
    AND review_state = 'Not started'
  );
CREATE POLICY "client edits open intake" ON public.client_portal_intake_sections
  FOR UPDATE TO authenticated
  USING (
    public.has_portal_access(auth.uid(), estate_id)
    AND status IN ('not_started','draft','changes_requested')
  )
  WITH CHECK (
    public.has_portal_access(auth.uid(), estate_id)
    AND status IN ('draft','submitted')
    AND review_state <> 'Accepted'
  );
CREATE TRIGGER trg_cpis_updated BEFORE UPDATE ON public.client_portal_intake_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ messages ============
CREATE TABLE public.client_portal_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  thread_key text NOT NULL DEFAULT 'main',
  body text NOT NULL,
  sender_user_id uuid,
  sender_name text,
  sender_role text NOT NULL DEFAULT 'client',
  related_request_id uuid REFERENCES public.client_portal_requests(id) ON DELETE SET NULL,
  attachment_document_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  sent_at timestamptz NOT NULL DEFAULT now(),
  read_by_client_at timestamptz,
  read_by_staff_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cpm_estate ON public.client_portal_messages(estate_id, sent_at);
GRANT SELECT, INSERT, UPDATE ON public.client_portal_messages TO authenticated;
GRANT ALL ON public.client_portal_messages TO service_role;
ALTER TABLE public.client_portal_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff manage messages" ON public.client_portal_messages
  FOR ALL TO authenticated
  USING (public.is_estate_staff(estate_id))
  WITH CHECK (public.is_estate_staff(estate_id));
CREATE POLICY "client reads messages" ON public.client_portal_messages
  FOR SELECT TO authenticated
  USING (public.has_portal_access(auth.uid(), estate_id));
CREATE POLICY "client sends messages" ON public.client_portal_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_portal_access(auth.uid(), estate_id)
    AND sender_user_id = auth.uid()
    AND sender_role = 'client'
  );

-- ============ income & expense submissions ============
CREATE TABLE public.client_portal_income_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  period_month date NOT NULL,
  period_label text,
  status text NOT NULL DEFAULT 'draft',
  household jsonb NOT NULL DEFAULT '{}'::jsonb,
  income jsonb NOT NULL DEFAULT '{}'::jsonb,
  expenses jsonb NOT NULL DEFAULT '{}'::jsonb,
  totals jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  submitted_at timestamptz,
  submitted_by uuid,
  review_state text NOT NULL DEFAULT 'Not started',
  review_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  linked_income_period_id uuid REFERENCES public.estate_income_periods(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (estate_id, period_month)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_income_submissions TO authenticated;
GRANT ALL ON public.client_portal_income_submissions TO service_role;
ALTER TABLE public.client_portal_income_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff manage income submissions" ON public.client_portal_income_submissions
  FOR ALL TO authenticated
  USING (public.is_estate_staff(estate_id))
  WITH CHECK (public.is_estate_staff(estate_id));
CREATE POLICY "client reads income submissions" ON public.client_portal_income_submissions
  FOR SELECT TO authenticated
  USING (public.has_portal_access(auth.uid(), estate_id));
CREATE POLICY "client creates income submissions" ON public.client_portal_income_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_portal_access(auth.uid(), estate_id)
    AND status IN ('draft','submitted')
    AND review_state = 'Not started'
  );
CREATE POLICY "client edits open income submissions" ON public.client_portal_income_submissions
  FOR UPDATE TO authenticated
  USING (
    public.has_portal_access(auth.uid(), estate_id)
    AND status IN ('draft','changes_requested')
  )
  WITH CHECK (
    public.has_portal_access(auth.uid(), estate_id)
    AND status IN ('draft','submitted')
    AND review_state <> 'Accepted'
  );
CREATE TRIGGER trg_cpisub_updated BEFORE UPDATE ON public.client_portal_income_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ event log: link to requests ============
ALTER TABLE public.client_portal_events
  ADD COLUMN IF NOT EXISTS request_id uuid REFERENCES public.client_portal_requests(id) ON DELETE SET NULL;

-- allow clients to append their own portal events (audit trail)
DROP POLICY IF EXISTS "client appends portal events" ON public.client_portal_events;
CREATE POLICY "client appends portal events" ON public.client_portal_events
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_portal_access(auth.uid(), estate_id)
    AND actor_user_id = auth.uid()
    AND actor_role = 'client'
  );

-- ============ storage policies for client uploads ============
-- objects are stored as: <estate_id>/<uuid>-<filename>
DROP POLICY IF EXISTS "portal client reads own estate objects" ON storage.objects;
CREATE POLICY "portal client reads own estate objects" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'client-portal-uploads'
    AND public.has_portal_access(auth.uid(), NULLIF(split_part(name, '/', 1), '')::uuid)
  );

DROP POLICY IF EXISTS "portal client uploads objects" ON storage.objects;
CREATE POLICY "portal client uploads objects" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'client-portal-uploads'
    AND public.has_portal_access(auth.uid(), NULLIF(split_part(name, '/', 1), '')::uuid)
  );

DROP POLICY IF EXISTS "portal staff manages objects" ON storage.objects;
CREATE POLICY "portal staff manages objects" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'client-portal-uploads'
    AND public.is_estate_staff(NULLIF(split_part(name, '/', 1), '')::uuid)
  )
  WITH CHECK (
    bucket_id = 'client-portal-uploads'
    AND public.is_estate_staff(NULLIF(split_part(name, '/', 1), '')::uuid)
  );