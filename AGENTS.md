# Agent rules

- Trust-account figures (balance, available-to-distribute, reconciliation state, trust risk flags, SRD) are computed only in `src/lib/trust/trustLedger.ts` from ledger rows; UI never accepts a typed balance. Why: Directive 5R8 requires balances traceable to entries, and Distribution approval gates depend on the same numbers.
- Estate Financials owns trust entry and reconciliation; creditor views use the same estate-scoped persisted postings, never a shared demo store. Why: cash belongs to the estate, and unavailable evidence must block distribution assessment.
- Accounting checks and SRD evidence gates abstain when bank provenance, pooled membership, tariff bases or schedule links are unavailable; posted ledgers are immutable and database-validated. Why: balanced cash alone does not establish regulatory compliance or bank-backed SRD accuracy.
- Trust Account uses Transactions, Reconciliation and Reports as its primary views, with entry and evidence tools in focused side panels. Why: trustees need a short daily workflow without duplicate financial navigation or permanent exception lists.
- Estate form version, applicability, status, grouping and next action come only from `src/lib/forms/formEngine.ts`; filing refuses until flags are fixed or acknowledged with a reason. Why: trustees must never pick a version, and filings need an auditable reason trail.
