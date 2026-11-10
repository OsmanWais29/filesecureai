// In-session trust ledger store (seeded demo). Replace with estate_bank_accounts /
// estate_receipts / estate_disbursements / estate_reconciliations when an estate is bound.
import { useSyncExternalStore } from "react";
import type { TrustLedger, TrustReceipt, TrustDisbursement, Reconciliation } from "./trustLedger";
import { computeBalances, reconcile } from "./trustLedger";

let ledger: TrustLedger = {
  account: { bank: "Royal Bank of Canada", last4: "4421", holder: "Sarah Johnson Trustee Inc. — in trust", designation: "estate_specific", dualSignatureThreshold: 5000, openedOn: "2026-02-10" },
  receipts: [
    { id: "r1", date: "2026-08-01", depositDate: "2026-08-01", source: "pad_payment", sourceRef: "PAD run Aug-2026", payer: "John Smith (debtor)", amount: 450, clearedOnStatement: true },
    { id: "r2", date: "2026-09-01", depositDate: "2026-09-01", source: "pad_payment", sourceRef: "PAD run Sep-2026", payer: "John Smith (debtor)", amount: 450, clearedOnStatement: true },
    { id: "r3", date: "2026-09-18", depositDate: "2026-09-19", source: "tax_refund", sourceRef: "CRA pre-bankruptcy refund 2025", payer: "Canada Revenue Agency", amount: 612.4, clearedOnStatement: true },
    { id: "r4", date: "2026-10-01", depositDate: "2026-10-01", source: "pad_payment", sourceRef: "PAD run Oct-2026", payer: "John Smith (debtor)", amount: 450, clearedOnStatement: true },
    { id: "r5", date: "2026-10-28", depositDate: "2026-10-29", source: "surplus_income", sourceRef: "Surplus income Q3", payer: "John Smith (debtor)", amount: 220, clearedOnStatement: true },
    { id: "r6", date: "2026-11-01", depositDate: "2026-11-02", source: "interest", sourceRef: "Bank interest Oct", payer: "RBC", amount: 1.2, clearedOnStatement: true },
  ],
  disbursements: [
    { id: "d1", date: "2026-08-05", kind: "filing_fee", payee: "Office of the Superintendent of Bankruptcy", reference: "Filing fee", amount: 150, approvals: ["S. Johnson"], cleared: true },
    { id: "d2", date: "2026-09-10", kind: "counselling_fee", payee: "Counselling session 1", reference: "BIA s.157.1", amount: 85, approvals: ["S. Johnson"], cleared: true },
    { id: "d3", date: "2026-10-15", kind: "trustee_fee", payee: "Sarah Johnson Trustee Inc.", reference: "Interim fee (tariff)", amount: 948.22, approvals: ["S. Johnson"], cleared: true },
  ],
  reconciliations: [],
  holdbacks: [{ id: "h1", reason: "Disputed claim — Capital One (pending s.135 review)", amount: 150 }],
  reserveForCosts: 0,
};
// seed one reconciliation that matches
{
  const b = computeBalances(ledger);
  ledger.reconciliations.push({ id: "c1", statementDate: "2026-11-03", statementBalance: b.ledgerBalance, reconciledOn: "2026-11-03", reconciledBy: "S. Johnson", ledgerBalanceAtDate: b.ledgerBalance, adjustedBankBalance: b.ledgerBalance, difference: 0 });
}

const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const uid = () => Math.random().toString(36).slice(2, 9);

export const trustStore = {
  get: () => ledger,
  subscribe: (f: () => void) => (subs.add(f), () => subs.delete(f)),
  addReceipt(r: Omit<TrustReceipt, "id">) { ledger = { ...ledger, receipts: [...ledger.receipts, { ...r, id: uid() }] }; emit(); },
  addDisbursement(d: Omit<TrustDisbursement, "id">) { ledger = { ...ledger, disbursements: [...ledger.disbursements, { ...d, id: uid() }] }; emit(); },
  /** Corrections are reversing entries — never edits or deletes. */
  reverseReceipt(id: string) {
    const r = ledger.receipts.find((x) => x.id === id);
    if (!r || r.reversedById || r.reversalOf) return;
    const rid = uid();
    ledger = { ...ledger, receipts: [...ledger.receipts.map((x) => (x.id === id ? { ...x, reversedById: rid } : x)), { ...r, id: rid, amount: -r.amount, reversalOf: id, reversedById: undefined, date: new Date().toISOString().slice(0, 10), sourceRef: `Reversal of ${r.sourceRef}` }] };
    emit();
  },
  markCleared(id: string) { ledger = { ...ledger, disbursements: ledger.disbursements.map((d) => (d.id === id ? { ...d, cleared: true } : d)) }; emit(); },
  addApproval(id: string, name: string) { ledger = { ...ledger, disbursements: ledger.disbursements.map((d) => (d.id === id && !d.approvals.includes(name) ? { ...d, approvals: [...d.approvals, name] } : d)) }; emit(); },
  reconcile(statementDate: string, statementBalance: number, by: string): Reconciliation {
    const b = computeBalances(ledger);
    const { adjustedBankBalance, difference } = reconcile(b.ledgerBalance, statementBalance, b.depositsInTransit, b.outstandingCheques);
    const rec = { id: uid(), statementDate, statementBalance, reconciledOn: new Date().toISOString().slice(0, 10), reconciledBy: by, ledgerBalanceAtDate: b.ledgerBalance, adjustedBankBalance, difference };
    ledger = { ...ledger, reconciliations: [...ledger.reconciliations, rec] };
    emit();
    return rec;
  },
};

export const useTrustLedger = () => useSyncExternalStore(trustStore.subscribe, trustStore.get, trustStore.get);
