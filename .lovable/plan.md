# Fix: "Could not create the invitation"

## What I found

The invitation insert is guaranteed to fail before RLS is ever evaluated.

`ClientPortalPanel.tsx` sends `clientId: \`client-${context.estateId}\`` (e.g. `client-694a402d-...`) into `createInvitation`, which writes it to `client_portal_invitations.client_id`. That column is typed `uuid` (verified in the database), so Postgres rejects the string with an invalid-UUID error. The catch block then shows the generic "Confirm you have trustee permissions" toast, which points at the wrong cause.

Two occurrences of the same synthetic id exist in `ClientPortalPanel.tsx` (the create step and a second call site further down).

Verified alongside this:
- RLS policy on `client_portal_invitations` is `is_estate_staff(estate_id)` for `authenticated` on all commands, and table grants for `authenticated` are present — so permissions are not the blocker for the estate owner.
- `client_id` has no foreign key, so leaving it null is safe.
- Estate `694a402d-...` ("ABC Filing INC.") is owned by user `savenosoulproduction@gmail.com` and has no `trustee_id`. No rows exist in `user_roles` for anyone, so `is_estate_staff` only passes for that owner. Signing in as any other trustee account will still be denied after the UUID bug is fixed.

## Changes

1. `src/components/estate/client-portal/ClientPortalPanel.tsx`
   - Stop fabricating `client-<estateId>`. Pass a real client UUID when one is known for the estate, otherwise omit `clientId` so the column stays null. Applies to both call sites.

2. `src/data/clientPortal/invitations.ts`
   - Guard `createInvitation` so a non-UUID `clientId` is coerced to `null` instead of being sent to Postgres.
   - Surface the real Postgres error message to the caller instead of swallowing it.

3. Error reporting in the panel
   - Show the underlying error text in the toast (and log it), distinguishing "not authorized for this estate" (RLS/42501) from other failures, so the next problem is diagnosable at a glance.

## Follow-up (not included unless you want it)

If invitations should be creatable by trustees who do not own the estate row, `is_estate_staff` needs a role source — either populate `user_roles` with `trustee`/`admin` rows, or set `estates.trustee_id`. Say the word and I'll add that as a separate step.
