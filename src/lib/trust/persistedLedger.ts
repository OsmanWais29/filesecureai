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

/** Only bank-side postings affect cash. Never add account opening_balance.
 *  A "reversal" entry (source_id = original entry id) is a new outflow line and
 *  marks the original receipt as reversed; nothing is ever deleted. */
export function ledgerFromPostings(entries: PostedTrustEntry[], through?: string): TrustLedger {
  const ledger: TrustLedger = { account: null, receipts: [], disbursements: [], reconciliations: [], holdbacks: [], reserveForCosts: 0 };
  const reversedBy = new Map<string, string>();
  for (const e of entries) if (e.source_type === "reversal" && e.source_id) reversedBy.set(e.source_id, e.id);
  for (const entry of entries) {
    const date = entry.gl_date ?? entry.created_at.slice(0, 10);
    if (through && date > through) continue;
    entry.lines.forEach((line, index) => {
      if (!line.account.startsWith("10000")) return;
      const amount = Number(line.debit) - Number(line.credit);
      const id = `${entry.id}:${index}`;
      if (amount > 0) ledger.receipts.push({ id, date, depositDate: null, source: entry.source_type === "pad_receipt" ? "pad_payment" : "other", sourceRef: entry.source_id ?? entry.id, payer: entry.memo ?? "Ledger receipt", amount, clearedOnStatement: false, reversedById: reversedBy.get(entry.id) });
      if (amount < 0) ledger.disbursements.push({ id, date, kind: "other", reference: entry.source_id ?? entry.id, payee: entry.memo ?? "Ledger payment", amount: -amount, approvals: [], cleared: false });
    });
  }
  return ledger;
}
