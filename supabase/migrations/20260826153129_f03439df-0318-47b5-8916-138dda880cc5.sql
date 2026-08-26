DROP POLICY IF EXISTS "Staff manage portal invitations" ON public.client_portal_invitations;

CREATE POLICY "Staff manage portal invitations"
ON public.client_portal_invitations
FOR ALL
TO authenticated
USING (public.is_estate_staff(estate_id))
WITH CHECK (public.is_estate_staff(estate_id));