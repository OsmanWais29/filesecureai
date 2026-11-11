# Trust Account: what is built and how it helps the trustee

This is an explanation only. Approving it changes nothing in the app.

## Where it lives
Each estate has its own **Trust Account** section in the estate menu, next to Financials. Creditor screens show the same balance and link back to it, so the money is entered only once, in the estate.

## The five pages

1. **Today**: a short list of things that need you now. It shows the balance, when the account was last reconciled, and any warnings, such as a missing reconciliation, a deposit not made on time, an outstanding levy, or a possible overdraft.
2. **Ledger**: every receipt and disbursement, with a running balance. Receipts include PAD payments, surplus income, tax refunds and asset sales. Disbursements include levy, fees and dividends. Each line shows where it came from and whether a bank transaction backs it. You never type the balance. It is always calculated from the entries.
3. **Payments**: preparing and approving money going out. A payment is blocked if it would take the estate below zero, go over the admin allowance (the $100 lump sum under Rule 128, or $0 for consumer proposals under Rule 129), or skip a required approval.
4. **Month-end**: monthly reconciliation of the bank statement against the ledger. Deposits in transit and uncleared cheques are listed, and any difference is flagged. A countdown follows Directive 5R8: reconcile within 45 days, and notify the OSB if an error is still unresolved after 75 days.
5. **Reports**: the Statement of Receipts and Disbursements (SRD), built from the ledger and never typed. It exports only once the checks pass. Draft exports carry a digital fingerprint (SHA-256) and are logged in the audit trail.

Entry tools (record a receipt, record a payment, set up the account, attach a bank statement) open in a side panel, so you never leave the page.

## Automatic checks
- Superintendent's levy on dividends
- Trustee fees against the tariff
- Admin allowances under Rules 128 and 129
- Proposal payments against the payment schedule
- No estate ever going negative
- Account type allowed for this kind of proceeding
- Stale cheques (older than 6 months) and late deposits

When information is missing, such as no bank feed, no tariff basis or no payment schedule, the check shows "Not checked" instead of guessing.

## Protections in the database
- Every posted entry must balance.
- An entry can only use bank accounts that belong to its estate.
- Balances cannot go negative.
- Posted entries cannot be edited. Mistakes are fixed with reversals, so there is a full trail.

## Distribution link
The Distribution "Available" amount comes from the Trust Account. "Approve" is blocked when:
- the payout is more than the balance,
- no claims are admitted,
- the account is not reconciled, or
- reserves are missing.

## Benefits for the trustee
- One place to enter money, with no double entry between estate and creditor screens.
- Balances and the SRD are right by construction, and the OSB can trace them to entries.
- The deadlines in Directive 5R8 are tracked for you.
- Mistakes are blocked before money moves, not found at audit time.
- Month-end only asks you to deal with the differences, not to re-check every line.

## Not yet in place
- **Live bank feed:** not connected. Bank evidence is attached by hand for now.
- **Pooled-account membership and tariff inputs:** not recorded yet, so the checks that need them show "Not checked".
- **$5,000 dual-approval threshold:** a placeholder that hasn't been checked against the directive.
- **Saving with a signed-in user:** recording an entry, reloading the estate and seeing the saved entry hasn't been tested yet.
