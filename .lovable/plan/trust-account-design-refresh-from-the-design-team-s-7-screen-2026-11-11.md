# Trust Account design refresh (from the design team's 7 screen prompts)

## What the trustee will see

The Trust Account keeps its five pages (Today, Ledger, Payments, Month-end, Reports) but each page is rebuilt to match the design team's mock-ups, using the same buttons, colours (red = blocked, amber = needs attention, blue = action, grey = information), money in monospace with 2 decimals, and extra room on labels for French.

**One important difference from the brief:** the brief asks for fictional numbers. The project rule is that every trust figure comes from the real ledger, so screens will show the estate's real figures. Where something isn't connected yet (Finix PAD, Inverite bank feed, pooled deposits across estates), the screen shows the brief's own "not set up" state with a setup button, never invented money.

### 1. Today
- Buttons: Import file, Record deposit, Record receipt (primary).
- Four figures as today, plus a caption under "Available to distribute" (e.g. PAD holdback) or "Assessment blocked" with the reason.
- Three status tiles: PAD status, Collection method, Last reconciled. New-estate versions read "No PAD agreement / Collection method not set / Never reconciled", each with a setup action; overdue reconciliation turns amber.
- "Needs your attention" rows with Why? and one action each, adding: PAD returned (NSF), unmatched import rows, amount due from firm (bank fee), and a red Blocked row when the trust balance doesn't match the estates.
- "What the OSB would see" adds "PAD collected but not deposited".

### 2. Record deposit (side panel)
Trust account, date, amount (or pick a statement line, which locks date/amount), a pre-ticked list of scheduled instalments with editable amounts, "Add estate" search, footer showing Deposit / Selected / Difference. Post stays disabled until the difference is $0.00, with a tooltip naming what's missing. Expandable ledger preview.

### 3. Import file (side panel)
Three steps with an indicator: Upload (type: bank statement / PAD report / returns report), Map columns (skipped for a known layout), Review (Matched / Needs a decision / Already imported, then "Post matched"). Duplicate file shows "Already imported on [date] by [name]"; unmatched rows wait on Today.

### 4. Ledger and Record return
Source badge per line (Finix / Import / Manual), amber "Not reconciled" dot, lock icon on locked month dividers, Source and Status filter chips. Locked lines offer "Correct in current month". New "Record return" panel (reason list, date, evidence, preview "Reverses $X on [estate]. Missed payments: N", Post reversal); reversals link to the original. No delete anywhere.

### 5. Month-end
Three-way card: Adjusted bank balance = Book balance = Sum of estate balances, with a Difference line. "How the bank figure is built" (statement, + deposits in transit, - outstanding cheques) with lists, statement file with short hash, "Sign and lock month". States: ready, blocked (largest unexplained items, button disabled), locked (signer and date, read-only).

### 6. Reports: Audit package
New card above the SRD: scope (This estate / Trust account, one month), date range, readiness checklist (ticks, amber items linking to the fix), 12-file contents list, Download, last export line with History. Shows "Draft" notice when items are open; progress while generating.

### 7. PAD panel, debtor portal, firm settings
- PAD side panel from the PAD tile: status, bank, schedule, missed payments, agreement, and a "Record agreement" path with the 4-item checklist for firms not on Finix.
- Client portal Banking & Payments: mobile-first 4 steps (review plan, add bank (secure form placeholder), sign, done) plus payment history with plain-language returned-payment message.
- Firm settings > Payments: one row per trust account with collection method and status; Finix row Blocked when payout isn't Gross.

## Build order
Today -> Record deposit -> Import -> Ledger/Return -> Month-end -> Audit package -> PAD/portal/settings, checking each against its mock-up before moving on.

## Technical details
- Split `EstateTrustAccount.tsx` (currently one large file) into `src/components/estate/trust/` pieces: `TrustToday`, `StatusTiles`, `AttentionList`, `RecordDepositPanel`, `ImportFilePanel`, `RecordReturnPanel`, `MonthEndCard`, `AuditPackageCard`, `PadPanel`.
- All figures and states derive from `trustLedger.ts` / `useEstateTrustLedger`; new pure helpers (three-way difference, deposit split difference, readiness checklist) go in `trustLedger.ts` with tests.
- PAD / Finix / Inverite / pooled-account data has no source yet: those components render their empty/setup states; posting from Deposit, Import and Return panels is disabled with "Not connected" until the data layer exists (technical team wires later, per the brief).
- No database changes in this pass.
