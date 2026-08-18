-- Estate record fields
ALTER TABLE public.estates
  ADD COLUMN IF NOT EXISTS debtor_kind text NOT NULL DEFAULT 'consumer',
  ADD COLUMN IF NOT EXISTS proceeding_type text,
  ADD COLUMN IF NOT EXISTS administration_type text,
  ADD COLUMN IF NOT EXISTS osb_estate_number text,
  ADD COLUMN IF NOT EXISTS file_status text,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS efile_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS middle_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS aka text,
  ADD COLUMN IF NOT EXISTS joint_filing boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marital_status text,
  ADD COLUMN IF NOT EXISTS language text,
  ADD COLUMN IF NOT EXISTS home_phone text,
  ADD COLUMN IF NOT EXISTS work_phone text,
  ADD COLUMN IF NOT EXISTS cell_phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS corporate_name text,
  ADD COLUMN IF NOT EXISTS operating_as text,
  ADD COLUMN IF NOT EXISTS business_number text,
  ADD COLUMN IF NOT EXISTS federal_charter_number text,
  ADD COLUMN IF NOT EXISTS incorporation_date date,
  ADD COLUMN IF NOT EXISTS incorporation_place text,
  ADD COLUMN IF NOT EXISTS nature_of_business text,
  ADD COLUMN IF NOT EXISTS date_started date,
  ADD COLUMN IF NOT EXISTS trustee_office text,
  ADD COLUMN IF NOT EXISTS service_location text,
  ADD COLUMN IF NOT EXISTS processing_centre text,
  ADD COLUMN IF NOT EXISTS local_or text,
  ADD COLUMN IF NOT EXISTS estate_administrator text,
  ADD COLUMN IF NOT EXISTS technician text,
  ADD COLUMN IF NOT EXISTS initial_interviewer text,
  ADD COLUMN IF NOT EXISTS office_manager text,
  ADD COLUMN IF NOT EXISTS court_name text,
  ADD COLUMN IF NOT EXISTS court_number text,
  ADD COLUMN IF NOT EXISTS division text,
  ADD COLUMN IF NOT EXISTS division_number text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS signup_date date,
  ADD COLUMN IF NOT EXISTS initial_contact_date date,
  ADD COLUMN IF NOT EXISTS appointment_date date,
  ADD COLUMN IF NOT EXISTS insolvency_date date,
  ADD COLUMN IF NOT EXISTS archive_box_number text,
  ADD COLUMN IF NOT EXISTS archive_sent_date date,
  ADD COLUMN IF NOT EXISTS sin text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS gst_refund_choice text,
  ADD COLUMN IF NOT EXISTS household_adults integer,
  ADD COLUMN IF NOT EXISTS household_minors integer,
  ADD COLUMN IF NOT EXISTS primary_cause text,
  ADD COLUMN IF NOT EXISTS secondary_cause text,
  ADD COLUMN IF NOT EXISTS cause_details text,
  ADD COLUMN IF NOT EXISTS record_extras jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS estates_user_osb_number_idx
  ON public.estates (user_id, osb_estate_number)
  WHERE osb_estate_number IS NOT NULL;

-- Canonical significant date register
CREATE TABLE IF NOT EXISTS public.estate_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  date_group text NOT NULL DEFAULT 'Bankruptcy',
  date_type text NOT NULL,
  date_value date,
  time_value time,
  source_type text NOT NULL DEFAULT 'Manual',
  source_document text,
  source_document_id uuid,
  source_page text,
  entered_by text,
  extracted_by text,
  confidence numeric,
  confirmed_by text,
  confirmed_date timestamptz,
  previous_value date,
  change_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (estate_id, date_type)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_dates TO authenticated;
GRANT ALL ON public.estate_dates TO service_role;
ALTER TABLE public.estate_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own estate dates" ON public.estate_dates
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_dates_updated_at BEFORE UPDATE ON public.estate_dates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Effective-dated assignment history
CREATE TABLE IF NOT EXISTS public.estate_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL,
  assignee_name text NOT NULL,
  assignee_user_id uuid,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_to date,
  assigned_by text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_assignments TO authenticated;
GRANT ALL ON public.estate_assignments TO service_role;
ALTER TABLE public.estate_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own estate assignments" ON public.estate_assignments
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Append-only estate audit ledger
CREATE TABLE IF NOT EXISTS public.estate_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  client_id uuid,
  event_type text NOT NULL,
  actor text,
  actor_type text NOT NULL DEFAULT 'user',
  before_state jsonb,
  after_state jsonb,
  reason text,
  source text,
  correlation_id uuid,
  evidence jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.estate_events TO authenticated;
GRANT ALL ON public.estate_events TO service_role;
ALTER TABLE public.estate_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their own estate events" ON public.estate_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users append their own estate events" ON public.estate_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS estate_events_estate_idx ON public.estate_events (estate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS estate_dates_estate_idx ON public.estate_dates (estate_id);
CREATE INDEX IF NOT EXISTS estate_assignments_estate_idx ON public.estate_assignments (estate_id);