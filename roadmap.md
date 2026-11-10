# Trust account rollout
- [ ] Simplify trustee workspace into Transactions, Reconciliation and Reports; focus entry in a side panel and clearly distinguish working automation from unavailable bank connectivity.
- [x] Make estate Financials the trust-account workspace; creditor screens link to the same saved estate figures.
- [x] Remove sample balances, enforce evidence-blocked availability, and correct reconciliation timing rules.

## Subsequent rollout scope (not implemented in this milestone)
Statement CSV import and reviewed matching; atomic posting; authenticated payment authorization; immutable reconciliation packages.

## Accounting controls requested
- [x] Add per-estate running ledger and existing statement-evidence views.
- [ ] Complete read-only bank matching and pooled monthly reconciliation — blocked by missing bank-provider connection, immutable transaction provenance and canonical pooled-account membership.
- [x] Add levy, tariff, administrative-disbursement, proposal-schedule and historical negative-balance checks with missing-evidence abstention.
- [ ] Enable live tariff/levy/schedule assessments — blocked by verified realization deductions, fee authority, levy-bearing payment basis and bank-to-schedule links.
- [x] Gate evidence-backed SRD export and identify unavailable bank-feed / pooled-account evidence.
