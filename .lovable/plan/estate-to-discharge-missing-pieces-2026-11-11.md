# Estate to discharge: missing pieces

## Findings
- **$5,000 two-person approval:** not in Directive 5R8. The directive requires the licensed trustee to approve each payment batch, with no dollar limit. The $5,000 figure becomes an optional firm setting, off by default. Every payment run still needs the trustee's approval.
- **OSB filing:** confirmed as an XML download from the Filing Centre. Nothing is sent to the OSB from the app.

## Phase 1: Trust account details trustees can enter and save
A "Trust settings" panel in each estate's Trust Account, saved to the estate:
- Account type (individual estate, consolidated summary, consolidated proposal), with the Superintendent's approval reference and date for consolidated accounts
- Trustee fee basis (tariff or court-approved), fee rate, and the levy rate and base
- Proposal payment schedule (amount, frequency, first and last date)
- Optional firm second-approval limit
Checks that now say "Not checked" start running once these are filled in. Every change goes into the audit trail.

## Phase 2: Bank feed and PAD (Inverite and Finix)
- Inverite: connect the trust bank account and pull transactions as read-only bank evidence; the trustee matches them in Month-end.
- Finix: collect PAD payments and record each settlement or return as a receipt.
- **Needs from you:** Inverite and Finix API keys (sandbox first), plus webhook signing secrets.

## Phase 3: Filing Centre XML download
- Make the XML download work for each form once the OSB schema file is loaded in the mapping studio.
- **Needs from you:** the OSB XML schema files (XSD) for the forms you file.

## Phase 4: Creditors
- Sort claims under BIA s.136 by claim type and security, not by creditor name.
- Notices create real records and documents (filing acknowledgement, missing proof, meeting, disallowance, dividend).
- The creditor Audit tab reads the real estate history.

## Phase 5: Meetings, dividends, discharge and closing
- Meeting of creditors: schedule, quorum, attendance, votes, inspectors, minutes.
- Dividends: proposed from admitted claims and trust funds, approved by the trustee, then paid. Unclaimed dividends get tracked and sent to the Superintendent.
- Discharge: track automatic discharge dates, creditor or OSB objections, hearings and outcome.
- Closing: final statement of receipts and disbursements, taxation, and trustee discharge checklist.

## Phase 6: Corporate and firm controls
- Corporate versions of Form 21.
- Track documents still owed by the debtor, with reminders through the client portal.
- Record-keeping period on closed files; trustee/office assignment filters.

## Order
Phases 1 and 4 to 6 can be built now. Phases 2 and 3 wait on the keys and schema files.

## Technical notes
- New settings live in an estate-scoped trust settings table with staff-only access rules; checks in `trustLedger.ts` read them.
- Inverite and Finix run in backend functions with keys stored as secrets; webhooks are signature-verified.
