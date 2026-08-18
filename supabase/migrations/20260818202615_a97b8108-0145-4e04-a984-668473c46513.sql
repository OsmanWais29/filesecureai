CREATE TABLE public.estate_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  note_date DATE,
  note_time TEXT,
  channel TEXT,
  direction TEXT,
  subject TEXT,
  party TEXT,
  contact_address TEXT,
  body TEXT,
  billable BOOLEAN NOT NULL DEFAULT false,
  minutes NUMERIC,
  follow_up_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_notes TO authenticated;
GRANT ALL ON public.estate_notes TO service_role;
ALTER TABLE public.estate_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own estate notes" ON public.estate_notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_notes_updated_at BEFORE UPDATE ON public.estate_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.estate_form_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  form_number TEXT NOT NULL,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  validation_state TEXT NOT NULL DEFAULT 'pending',
  validation_messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  signing_date DATE,
  generated_at TIMESTAMPTZ,
  filed_at TIMESTAMPTZ,
  document_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_form_instances TO authenticated;
GRANT ALL ON public.estate_form_instances TO service_role;
ALTER TABLE public.estate_form_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own estate forms" ON public.estate_form_instances FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_form_instances_updated_at BEFORE UPDATE ON public.estate_form_instances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.estate_discharge_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  opposition BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (estate_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_discharge_reports TO authenticated;
GRANT ALL ON public.estate_discharge_reports TO service_role;
ALTER TABLE public.estate_discharge_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own discharge reports" ON public.estate_discharge_reports FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_discharge_reports_updated_at BEFORE UPDATE ON public.estate_discharge_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.estate_closings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
  closing_date DATE,
  closed BOOLEAN NOT NULL DEFAULT false,
  closed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (estate_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estate_closings TO authenticated;
GRANT ALL ON public.estate_closings TO service_role;
ALTER TABLE public.estate_closings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own estate closings" ON public.estate_closings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_closings_updated_at BEFORE UPDATE ON public.estate_closings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();