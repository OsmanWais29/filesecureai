-- 1) Fix profile creation trigger: profiles has (id, email, full_name, avatar_url); there is no "handle" column.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

-- 2) Make the other signup-time triggers fault tolerant so they can never block account creation.
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  BEGIN
    INSERT INTO public.user_preferences (user_id) VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user_preferences failed for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  BEGIN
    INSERT INTO public.user_settings (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user_settings failed for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
      NEW.id,
      COALESCE((NEW.raw_user_meta_data->>'user_type')::public.user_role, 'client'::public.user_role)
    )
    ON CONFLICT (user_id, role) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user_role failed for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

-- 3) Idempotent / retry-safe invitation redemption.
CREATE OR REPLACE FUNCTION public.redeem_client_portal_invitation(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE inv public.client_portal_invitations%ROWTYPE; h text; uid uuid; uemail text; has_access boolean;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  SELECT lower(email) INTO uemail FROM auth.users WHERE id = uid;

  h := encode(extensions.digest(p_token, 'sha256'), 'hex');
  SELECT * INTO inv FROM public.client_portal_invitations WHERE token_hash = h FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid'); END IF;

  -- Retry-safe: same user re-running a successful redemption.
  IF inv.redeemed_at IS NOT NULL THEN
    IF inv.redeemed_by IS DISTINCT FROM uid THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'used');
    END IF;
    SELECT EXISTS (
      SELECT 1 FROM public.client_portal_access
      WHERE user_id = uid AND estate_id = inv.estate_id AND status = 'active'
    ) INTO has_access;
    IF has_access THEN
      RETURN jsonb_build_object('ok', true, 'estate_id', inv.estate_id, 'client_id', inv.client_id, 'already_redeemed', true);
    END IF;
    IF inv.status = 'revoked' THEN RETURN jsonb_build_object('ok', false, 'reason', 'revoked'); END IF;
    IF inv.status = 'suspended' THEN RETURN jsonb_build_object('ok', false, 'reason', 'suspended'); END IF;
    -- Access row missing but this user owns the redemption: restore it.
    INSERT INTO public.client_portal_access (user_id, estate_id, client_id, invitation_id, status, granted_by)
    VALUES (uid, inv.estate_id, inv.client_id, inv.id, 'active', inv.created_by)
    ON CONFLICT (user_id, estate_id)
    DO UPDATE SET status = 'active', disabled_at = NULL, invitation_id = inv.id, updated_at = now();
    RETURN jsonb_build_object('ok', true, 'estate_id', inv.estate_id, 'client_id', inv.client_id, 'already_redeemed', true);
  END IF;

  IF inv.status = 'revoked' THEN RETURN jsonb_build_object('ok', false, 'reason', 'revoked'); END IF;
  IF inv.status = 'suspended' THEN RETURN jsonb_build_object('ok', false, 'reason', 'suspended'); END IF;
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

  RETURN jsonb_build_object('ok', true, 'estate_id', inv.estate_id, 'client_id', inv.client_id, 'already_redeemed', false);
END; $$;