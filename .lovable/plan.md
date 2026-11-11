# Trust Account as its own estate section (Directive 5R8)

## What changes for the trustee
Trust Account moves out of Financials and becomes its own top-level section in the estate menu, placed right after Financials. Old links (Financials > Trust Account) redirect to the new section.

The section is built around one idea: **the trustee only looks at exceptions.** Five tabs, in the order work actually happens:

1. **Today** (home) - a short to-do list: unmatched bank transactions, payments awaiting approval, reconciliation countdown ("October: 12 of 45 days left"), and plain-language warnings ("This estate would go negative by $38.20 if this payment runs"). Each warning has a "Why?" link to the 5R8 rule. Empty list = "All clear".
2. **Ledger** - read-only running balance for this estate. Every line shows payer/payee, date, nature, amount and its bank reference. Corrections are done with a "Reverse" button, never by editing. Expected vs received proposal payments and the missed-payment count toward deemed annulment.
3. **Payments** - system proposes levy, fees and dividends; trustee reviews, LIT approves. Submission is blocked (not just flagged) for overdrafts, wrong account type, cap breaches (Rule 128 $100, Rule 129 $0). Shows creditors missing Schedule 3 consent, trace numbers, initiating LIT, and the 72-hour remittance clock.
4. **Month-end** - reconciliation prepared automatically: bank balance vs ledger, outstanding cheques/deposits, cheques older than 6 months with an explanation field, preparer, and one sign-and-date step (Schedule 4 attestation for individual accounts). 45-day and 75-day clocks; 75-day breach drafts the OSB written notice.
5. **Reports** - SRD built from the ledger (with interest total), plus drafts of the Annual Banking Report (April 30 master list), bank-change notice and software-change notice.

A simple **Account setup** side panel (opened from the header) records the linked trust account: type (consolidated summary, consolidated proposal, individual estate, trust transfer, pre-filing deposits), bank, transit, last 4 digits, trustee firm as holder, and Superintendent approval for consolidated accounts. The estate is then routed to the right account automatically, and a proposal estate cannot be placed in a summary account.

An **OSB view** card on Today shows what the OSB's analysis would flag: negative balance, closed estate holding money, active estate with no balance and no SRD, bank vs reconciled mismatch.

## Honest limits
- No live bank feed is connected yet; the inbox works from imported statement lines and says so. Matching suggestions use PAD reference, amount, schedule and payer name.
- E-signature captures signer, intent, timestamp and a document fingerprint; it is not a certified third-party e-signature service.
- Interest allocation and the firm-wide Annual Banking Report need all estates in a pooled account; where that data is missing the screen shows "Can't assess yet" with what's missing.

## Technical details
- Add `trust` top-level module in `estateNavigation.ts`; remove it from Financials sub-pages; redirect `?m=financials&p=trust` to `?m=trust`.
- Split `EstateTrustAccount.tsx` into `trust/TodayView`, `LedgerView`, `PaymentsView`, `MonthEndView`, `ReportsView`, `AccountSetupPanel`.
- All figures and blocks keep coming from `src/lib/trust/trustLedger.ts` (per AGENTS.md); add pure functions for exception list, 6-month stale cheques, 72h remittance, account-type routing, OSB-view flags, deemed-annulment count. Tests for each rule.
- Migration: add account type, transit, Superintendent-approval fields to bank accounts; tables for payment batches (trace number, initiating LIT, approval), Schedule 3 consents (firm-wide, reusable), reconciliation sign-offs (signer, timestamp, SHA-256), all with grants + RLS via `is_estate_staff`; append-only triggers.
- Update AGENTS.md trust-layout rule to the new five-tab structure.
