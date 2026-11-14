REVOKE ALL ON public.estate_assessments FROM anon;
ALTER TABLE public.estate_assessments DROP CONSTRAINT estate_assessments_user_id_fkey;
CREATE INDEX estate_assessments_estate_idx ON public.estate_assessments(estate_id, created_at DESC);
COMMENT ON TABLE public.estate_assessments IS 'Permanent estate assessments. Signed-in Data API access is intentionally granted; RLS restricts records to estate staff.';