import type { TrustLedger } from "./trustLedger";

export interface PostedTrustEntry {
  id: string;
  gl_date: string | null;
  memo: string | null;
  source_type: string;
  source_id?: string | null;
  created_at: string;
  lines: { account: string; debit: number; credit: number }[];
}

/** Only bank-side postings affect cash. Never add account opening_balance. */
export function ledgerFromPostings(entries: PostedTrustEntry[], through?: string): TrustLedger {
  const ledger: TrustLedger = { account: null, receipts: [], disbursements: [], reconciliations: [], holdbacks: [], reserveForCosts: 0 };
  for (const entry of entries) {
    const date = entry.gl_date ?? entry.created_at.slice(0, 10);
    if (through && date > through) continue;
    entry.lines.forEach((line, index) => {
      if (!line.account.startsWith("10000")) return;
      const amount = Number(line.debit) - Number(line.credit);
      const id = `${entry.id}:${index}`;
      if (amount > 0) ledger.receipts.push({ id, date, depositDate: null, source: "other", sourceRef: entry.source_id ?? entry.id, payer: entry.memo ?? "Ledger receipt", amount, clearedOnStatement: false });
      if (amount < 0) ledger.disbursements.push({ id, date, kind: "other", reference: entry.source_id ?? entry.id, payee: entry.memo ?? "Ledger payment", amount: -amount, approvals: [], cleared: false });
    });
  }
  return ledger;
}