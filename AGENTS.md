# Agent rules

- Trust-account figures (balance, available-to-distribute, reconciliation state, trust risk flags, SRD) are computed only in `src/lib/trust/trustLedger.ts` from ledger rows; UI never accepts a typed balance. Why: Directive 5R8 requires balances traceable to entries, and Distribution approval gates depend on the same numbers.
