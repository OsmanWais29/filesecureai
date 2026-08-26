# Send real client portal invitation emails

Today "Send" only marks the invitation as sent (`EMAIL_DELIVERY_CONFIGURED = false`). The trustee must copy the link manually, and if the page reloads before copying, the raw token is lost and the invitation has to be reissued. This plan makes the invite link actually arrive in the client's inbox.

## Email provider

This project uses an externally linked Supabase instance, so Lovable's built-in app-email system isn't available. We'll use **Resend** through the Lovable connector (you create the Resend account and verify your sending domain; no API key pasted into code).

## How it will work

1. Trustee clicks **Create client portal** — unchanged. A one-time token is minted and only its hash is stored.
2. The raw token is passed straight to a new secure server function, which emails the activation link to the client. The token is never stored, never logged, and never returned to the browser after sending.
3. The invitation is marked `sent`, `sent_at` / `last_sent_at` recorded, and a `client_portal_events` row is written.
4. **Resend** on an existing invitation mints a fresh token (invalidating the previous one), re-emails it, and bumps `resend_count`.
5. Copy-link stays available as a fallback for the freshly created invitation.
6. Expired or revoked invitations refuse to send, with a clear message.

## Email content

Branded to the firm on the invitation record: firm name, trustee name, estate/proceeding reference, a single **Activate your secure portal** button, the expiry date, and a short "you weren't expecting this? contact your trustee" note. Plain-text fallback included.

## Technical details

- **Connector**: link Resend via the standard connector; calls go through the Lovable connector gateway from the server only.
- **New edge function** `send-portal-invitation` (`verify_jwt` handled in code):
  - Validates the caller's JWT, then re-checks `is_estate_staff(estate_id)` with the caller's token so a non-trustee cannot email invites.
  - Validates input with Zod (`invitationId`, `estateId`, raw `token`).
  - Loads the invitation with the service role, confirms status is `created`/`sent`/`opened` and not expired, rebuilds the activation URL from the request origin, sends via Resend, then updates `status`, `sent_at`, `last_sent_at`, `resend_count` and inserts a `client_portal_events` row.
  - Never logs the token or the full URL.
- **Client changes** (`src/data/clientPortal/invitations.ts`):
  - `markInvitationSent` becomes a real `supabase.functions.invoke("send-portal-invitation", …)` call.
  - Add `resendInvitation(invitationId)` that mints a new token, updates the stored hash + expiry, and invokes the same function.
  - Flip `EMAIL_DELIVERY_CONFIGURED` to true so the UI stops labelling invitations as "simulated".
- **UI** (`ClientPortalPanel.tsx`): "Send" and "Resend" show real success/failure toasts and surface the provider error text on failure; the simulated-delivery warning is removed.
- No schema migration required — the existing `client_portal_invitations` columns already cover sent/resend tracking.

## Verification

Create an invitation against a test estate, confirm the email arrives, activate through the emailed link, and confirm the `client_portal_access` row and `client_portal_events` trail are written.
