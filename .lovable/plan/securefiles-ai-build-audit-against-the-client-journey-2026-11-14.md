# SecureFiles AI — Build Audit Against the Client Journey

Audit of the app compared with your 10-stage client journey. "Partial" means a screen exists but key records, rules or saving are missing. Nothing has been tested while signed in, because the preview opens on the sign-in page.

## Complete (built and working on saved data)

- [x] Estate workspace with navigation (Overview, Estate Record, Office & Team, Workflow, Financials, Trust Account, Creditors, Documents, Compliance)
- [x] Create estate, estate record, key dates, team assignments, timeline/activity history
- [x] Client portal: invite link, account setup, consents, requests, document upload, monthly income reports
- [x] Trustee review of portal submissions
- [x] Surplus income using official OSB 2024–2026 standards (Directive 11R2-2026)
- [x] AI reading of client income images into draft figures, trustee must confirm
- [x] Financials workbench: "Needs you" list, payment tracking, trends, payout estimate
- [x] Trust Account (Today, Ledger, Payments, Month-end, Reports): calculated balances, deposits, matched file imports, reversals, signed PAD agreement, trustee approval on every posting, 45/75-day reconciliation rules, levy/Rule 128/129/schedule checks, SRD draft from ledger
- [x] Per-estate trust settings saved by the trustee
- [x] Forms: correct OSB numbers/names, version by date, deadlines from recorded dates, missing-detail entry, official PDF previews, "Filed" only with OSB evidence
- [x] Filing Centre: firm-wide queue, filing plan, Form 65 batches, sign queue, deadline calendar, office-visit export, OSB acknowledgement recording
- [x] Creditor ranking under BIA s.136 from claim type; creditor Audit tab from real history
- [x] Audit trail with SHA-256 hashing on evidence and exports
- [x] Analytics split into Regulatory, Firm performance, Benchmarks; live estate financial rollups
- [x] Sidebar ordered by the client cycle

## Partial (screen exists, not finished)

- [ ] Intake CRM (stage 1) — leads exist; no lead-source or referral-payment disclosure record
- [ ] Counselling (stage 5) — simple tab; no 1R8 timing windows, counsellor qualification check or certificate
- [ ] Assets (stage 7) — asset list; no provincial exemptions or valuation evidence
- [ ] Tax (stage 7) — basic tab; no pre/post-filing return tracking or CRA refund as estate asset
- [ ] Discharge (stage 9) — short tab; no first-time/repeat/surplus timing, s.170 report, oppositions or court outcome
- [ ] Closing (stage 10) — short tab; no final dividend, taxation of accounts, trustee discharge
- [ ] Creditor page — "AI Scan Documents", Form 12 and notice buttons only show messages
- [ ] Analytics Regulatory/Benchmark figures — still partly illustrative
- [ ] Roles — a role check exists, but LIT-only actions (sign, admit claims, approve distributions) are not enforced everywhere

## Not built yet

1. Assessment record (stage 2): options explained, debtor acknowledgement, ID check, prior-insolvency check, assessor and LIT supervision (Directive 6R7)
2. Day-one notices (stage 4): s.102 5-day creditor notice, s.66.14 10-day proposal report, proof of mailing
3. Claims register: admit/disallow workflow with s.135 notices
4. Meetings and inspectors: 45-day request window (s.66.15), deemed approval (s.66.22), quorum, votes, minutes, resolutions
5. Proposal default/annulment tracking (3 months, s.66.31), amendments, certificate of full performance (s.66.38)
6. Dividends and unclaimed dividends
7. Multiple administrators: firm switch, joint, amended, annulled and repeat proceedings
8. Record retention, destruction schedule and legal hold
9. Firm compliance: staff licensing, training, complaints, breach log, outsourcing notices (Inverite, Finix, hosting)
10. New roles: trust accountant, firm compliance officer, read-only time-limited OSB examiner login
11. One-click estate audit pack (timeline, forms, receipts, reconciliations, claims, counselling, AI log, hash check) and firm-level pack
12. Monthly self-audit sampling like the OSB, routed to the LIT
13. Date-anchored rule registry so the proposed Nov 2025 amendments switch on only for new estates at their in-force date
14. Corporate Form 21; tracking documents the debtor still owes

## Waiting on you (cannot be built without)

- Inverite bank feed and Finix PAD — API keys and webhook secrets
- Filing Centre XML download — OSB XSD schema files
- Signed-in testing — sign in to the preview so save/reload can be checked

## Suggested build order

1. Claims register + day-one notices (most-reviewed after filing)
2. Assessment record + counselling upgrade
3. Meetings, proposal default/annulment, dividends
4. Discharge and closing workflows, retention
5. Roles enforcement, examiner login, audit pack, self-audit
6. Firm compliance and rule registry

Approve this to start on step 1, or tell me which step to begin with.
