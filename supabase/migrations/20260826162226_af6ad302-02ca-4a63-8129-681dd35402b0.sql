CREATE POLICY "Portal clients can view their authorized estate"
ON public.estates
FOR SELECT
TO authenticated
USING (public.has_portal_access(auth.uid(), id));

CREATE POLICY "Portal clients can view their redeemed invitation"
ON public.client_portal_invitations
FOR SELECT
TO authenticated
USING (redeemed_by = auth.uid());