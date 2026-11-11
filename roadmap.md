# Trust account rollout
- [x] Simplify trustee workspace into Transactions, Reconciliation and Reports; focus entry in a side panel and clearly distinguish working automation from unavailable bank connectivity. Isolated desktop/mobile presentation verified; authenticated save/read-back unavailable with externally managed authentication.
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

## Estate to discharge (plan of Nov 11, 2026)
- [x] Trust settings trustees enter and save (account type, Superintendent approval, fees, levy, proposal schedule, optional firm approval limit); checks use them.
- [x] $5,000 two-person limit checked: not in Directive 5R8; now an optional firm setting.
- [x] Creditor import ranks claims under BIA s.136 from the stated claim type, not the name.
- [x] Creditor Audit tab reads the estate's real history.
- [ ] Inverite bank feed and Finix PAD — waiting on API keys and webhook secrets.
- [ ] Filing Centre XML download — waiting on OSB XSD schema files.
- [ ] Creditor notices as real records and documents.
- [ ] Meetings of creditors, dividends/unclaimed dividends, discharge and closing workflow.
- [ ] Corporate Form 21, debtor-owed documents tracking, retention period, trustee/office filters.
