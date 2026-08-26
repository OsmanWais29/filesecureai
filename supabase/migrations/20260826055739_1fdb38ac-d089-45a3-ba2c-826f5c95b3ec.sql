-- ============ invitations ============
CREATE TABLE public.client_portal_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  client_id uuid,
  invited_email text NOT NULL,
  invited_name text,
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'created'
    CHECK (status IN ('created','sent','opened','active','expired','revoked','suspended')),
  firm_name text,
  office_name text,
  trustee_name text,
  proceeding_label text,
  created_by uuid NOT NULL,
  created_by_name text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  sent_at timestamptz,
  opened_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by uuid,
  revoked_at timestamptz,
  suspended_at timestamptz,
  resend_count integer NOT NULL DEFAULT 0,
  last_sent_at timestamptz,
  last_activity_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cpi_estate ON public.client_portal_invitations(estate_id);
CREATE INDEX idx_cpi_email ON public.client_portal_invitations(lower(invited_email));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_invitations TO authenticated;
GRANT ALL ON public.client_portal_invitations TO service_role;
ALTER TABLE public.client_portal_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage portal invitations"
ON public.client_portal_invitations FOR ALL TO authenticated
USING (public.get_user_role(auth.uid()) IN ('trustee','admin'))
WITH CHECK (public.get_user_role(auth.uid()) IN ('trustee','admin'));

CREATE TRIGGER update_client_portal_invitations_updated_at
BEFORE UPDATE ON public.client_portal_invitations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ access ============
CREATE TABLE public.client_portal_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  client_id uuid,
  invitation_id uuid REFERENCES public.client_portal_invitations(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid,
  disabled_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, estate_id)
);
CREATE INDEX idx_cpa_user ON public.client_portal_access(user_id);
CREATE INDEX idx_cpa_estate ON public.client_portal_access(estate_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_access TO authenticated;
GRANT ALL ON public.client_portal_access TO service_role;
ALTER TABLE public.client_portal_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients read own portal access"
ON public.client_portal_access FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Staff manage portal access"
ON public.client_portal_access FOR ALL TO authenticated
USING (public.get_user_role(auth.uid()) IN ('trustee','admin'))
WITH CHECK (public.get_user_role(auth.uid()) IN ('trustee','admin'));

CREATE TRIGGER update_client_portal_access_updated_at
BEFORE UPDATE ON public.client_portal_access
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ events ============
CREATE TABLE public.client_portal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  invitation_id uuid REFERENCES public.client_portal_invitations(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  actor_user_id uuid,
  actor_name text,
  actor_role text NOT NULL DEFAULT 'system' CHECK (actor_role IN ('staff','client','system')),
  previous_state text,
  new_state text,
  detail text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cpe_estate ON public.client_portal_events(estate_id, occurred_at DESC);

GRANT SELECT, INSERT ON public.client_portal_events TO authenticated;
GRANT ALL ON public.client_portal_events TO service_role;
ALTER TABLE public.client_portal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read portal events"
ON public.client_portal_events FOR SELECT TO authenticated
USING (public.get_user_role(auth.uid()) IN ('trustee','admin'));

CREATE POLICY "Authenticated append portal events"
ON public.client_portal_events FOR INSERT TO authenticated
WITH CHECK (true);

-- ============ authorization helper ============
CREATE OR REPLACE FUNCTION public.has_portal_access(_user_id uuid, _estate_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.client_portal_access
    WHERE user_id = _user_id AND estate_id = _estate_id AND status = 'active'
  );
$$;

-- ============ safe pre-auth peek ============
CREATE OR REPLACE FUNCTION public.peek_client_portal_invitation(p_token text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE inv public.client_portal_invitations%ROWTYPE; h text;
BEGIN
  h := encode(extensions.digest(p_token, 'sha256'), 'hex');
  SELECT * INTO inv FROM public.client_portal_invitations WHERE token_hash = h;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid'); END IF;
  IF inv.status = 'revoked' THEN RETURN jsonb_build_object('ok', false, 'reason', 'revoked'); END IF;
  IF inv.status = 'suspended' THEN RETURN jsonb_build_object('ok', false, 'reason', 'suspended'); END IF;
  IF inv.redeemed_at IS NOT NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'used'); END IF;
  IF inv.expires_at < now() THEN RETURN jsonb_build_object('ok', false, 'reason', 'expired'); END IF;
  RETURN jsonb_build_object(
    'ok', true,
    'invitation_id', inv.id,
    'invited_email', inv.invited_email,
    'invited_name', inv.invited_name,
    'firm_name', inv.firm_name,
    'expires_at', inv.expires_at
  );
END; $$;

-- ============ open marker ============
CREATE OR REPLACE FUNCTION public.mark_client_portal_invitation_opened(p_token text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE inv public.client_portal_invitations%ROWTYPE; h text;
BEGIN
  h := encode(extensions.digest(p_token, 'sha256'), 'hex');
  SELECT * INTO inv FROM public.client_portal_invitations WHERE token_hash = h;
  IF NOT FOUND OR inv.redeemed_at IS NOT NULL THEN RETURN; END IF;
  IF inv.status IN ('created','sent') THEN
    UPDATE public.client_portal_invitations
      SET status = 'opened', opened_at = COALESCE(opened_at, now()), last_activity_at = now()
      WHERE id = inv.id;
    INSERT INTO public.client_portal_events (estate_id, invitation_id, event_type, actor_role, previous_state, new_state, detail)
    VALUES (inv.estate_id, inv.id, 'CLIENT_PORTAL_INVITE_OPENED', 'client', inv.status, 'opened', 'Invitation link opened');
  END IF;
END; $$;

-- ============ redemption ============
CREATE OR REPLACE FUNCTION public.redeem_client_portal_invitation(p_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE inv public.client_portal_invitations%ROWTYPE; h text; uid uuid; uemail text;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  SELECT lower(email) INTO uemail FROM auth.users WHERE id = uid;

  h := encode(extensions.digest(p_token, 'sha256'), 'hex');
  SELECT * INTO inv FROM public.client_portal_invitations WHERE token_hash = h FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid'); END IF;
  IF inv.status = 'revoked' THEN RETURN jsonb_build_object('ok', false, 'reason', 'revoked'); END IF;
  IF inv.status = 'suspended' THEN RETURN jsonb_build_object('ok', false, 'reason', 'suspended'); END IF;
  IF inv.redeemed_at IS NOT NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'used'); END IF;
  IF inv.expires_at < now() THEN RETURN jsonb_build_object('ok', false, 'reason', 'expired'); END IF;
  IF uemail IS DISTINCT FROM lower(inv.invited_email) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'email_mismatch');
  END IF;

  INSERT INTO public.client_portal_access (user_id, estate_id, client_id, invitation_id, status, granted_by)
  VALUES (uid, inv.estate_id, inv.client_id, inv.id, 'active', inv.created_by)
  ON CONFLICT (user_id, estate_id)
  DO UPDATE SET status = 'active', disabled_at = NULL, invitation_id = inv.id, updated_at = now();

  UPDATE public.client_portal_invitations
    SET status = 'active', redeemed_at = now(), redeemed_by = uid, last_activity_at = now()
    WHERE id = inv.id;

  INSERT INTO public.client_portal_events (estate_id, invitation_id, event_type, actor_user_id, actor_name, actor_role, previous_state, new_state, detail)
  VALUES (inv.estate_id, inv.id, 'CLIENT_PORTAL_INVITE_ACCEPTED', uid, inv.invited_email, 'client', inv.status, 'active', 'Invitation redeemed');

  RETURN jsonb_build_object('ok', true, 'estate_id', inv.estate_id, 'client_id', inv.client_id);
END; $$;

-- ============ login marker ============
CREATE OR REPLACE FUNCTION public.record_client_portal_login()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r RECORD;
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  FOR r IN SELECT * FROM public.client_portal_access WHERE user_id = auth.uid() AND status = 'active' LOOP
    UPDATE public.client_portal_access SET last_login_at = now() WHERE id = r.id;
    INSERT INTO public.client_portal_events (estate_id, invitation_id, event_type, actor_user_id, actor_role, detail)
    VALUES (r.estate_id, r.invitation_id, 'CLIENT_LOGIN', auth.uid(), 'client', 'Client signed in to portal');
  END LOOP;
END; $$;

GRANT EXECUTE ON FUNCTION public.peek_client_portal_invitation(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_client_portal_invitation_opened(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_client_portal_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_client_portal_login() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_portal_access(uuid, uuid) TO authenticated;