import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBankAccounts, useLedgerEntries, useReceipts, useDisbursements } from "./useEstateAccounting";
import { useReconciliations } from "./useEstateSchedules";
import { ledgerFromPostings } from "@/lib/trust/persistedLedger";
import { computeBalances, reconcile, accountingChecks, type TrustLedger, type ReceiptSource, type DisbursementKind } from "@/lib/trust/trustLedger";
import { useEstateRow } from "./useEstateRecords";

export interface BankEvidenceRow {
  id: string;
  reconciliation_id: string;
  line_date: string | null;
  description: string | null;
  amount: number;
  direction: string;
  matched_receipt_id: string | null;
  matched_disbursement_id: string | null;
  match_state: string;
}

export function useEstateTrustLedger(estateId?: string) {
  const accounts = useBankAccounts(estateId);
  const entries = useLedgerEntries(estateId);
  const receipts = useReceipts(estateId);
  const payments = useDisbursements(estateId);
  const reconciliations = useReconciliations(estateId);
  const estate = useEstateRow(estateId);
  const matches = useQuery({
    queryKey: ["estate_statement_lines", estateId], enabled: Boolean(estateId),
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("estate_statement_lines").select("*").eq("estate_id", estateId).order("line_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BankEvidenceRow[];
    },
  });
  const queries = [accounts, entries, receipts, payments, reconciliations, matches, estate];
  const isLoading = Boolean(estateId) && queries.some(q => q.isLoading);
  const error = queries.find(q => q.error)?.error;
  const ledger: TrustLedger = ledgerFromPostings(entries.data ?? []);
  const account = accounts.data?.find(a => a.is_default && !a.closed_date) ?? accounts.data?.find(a => !a.closed_date);
  if (account) ledger.account = { bank: account.institution ?? "Bank not recorded", last4: (account.account_number ?? "").slice(-4), holder: "Account holder not yet recorded", designation: "estate_specific", dualSignatureThreshold: null, openedOn: account.opened_date ?? "" };
  ledger.receipts = ledger.receipts.map(r => {
    const source = receipts.data?.find(s => s.id === r.sourceRef);
    const allocations = source?.estate_receipt_allocations ?? [];
    const category: ReceiptSource = allocations.some(a => /surplus/i.test(a.gl_account)) ? "surplus_income" : allocations.some(a => /tax refund/i.test(a.gl_account)) ? "tax_refund" : allocations.some(a => /asset/i.test(a.gl_account)) ? "asset_sale" : allocations.some(a => /interest/i.test(a.gl_account)) ? "interest" : source?.payment_method === "PAD" ? "pad_payment" : "other";
    return { ...r, source: category, payer: source?.received_from ?? r.payer, depositDate: source?.deposit_date ?? null, clearedOnStatement: Boolean(source && matches.data?.some(m => m.matched_receipt_id === source.id && m.match_state === "matched" && Math.abs(Math.abs(Number(m.amount)) - r.amount) < 0.005 && m.direction === "credit")) };
  });
  ledger.disbursements = ledger.disbursements.map(d => {
    const source = payments.data?.find(s => s.id === d.reference);
    const type = source?.disbursement_type?.toLowerCase() ?? "";
    const category: DisbursementKind = type.includes("levy") ? "superintendent_levy" : /trustee fee|interim draw/.test(type) ? "trustee_fee" : type.includes("counselling") ? "counselling_fee" : /or fee|court fee|filing/.test(type) ? "filing_fee" : type.includes("administrative disbursement") ? "administrative_disbursement" : type.includes("dividend") ? "dividend" : type.includes("secured") ? "secured_payout" : "other";
    return { ...d, kind: category, payee: source?.payee ?? d.payee, cleared: Boolean(source && matches.data?.some(m => m.matched_disbursement_id === source.id && m.match_state === "matched" && Math.abs(Math.abs(Number(m.amount)) - d.amount) < 0.005 && m.direction === "debit")) };
  });
  ledger.reconciliations = (reconciliations.data ?? []).filter(r => r.statement_end).map(r => {
    const balance = computeBalances(ledgerFromPostings(entries.data ?? [], r.statement_end ?? undefined)).ledgerBalance;
    const adjusted = reconcile(balance, Number(r.closing_statement_balance), Number(r.deposits_in_transit), Number(r.outstanding_withdrawals));
    return { id: r.id, statementDate: r.statement_end ?? "", statementBalance: Number(r.closing_statement_balance), reconciledOn: r.approval_date ?? "", reconciledBy: r.reviewer ?? "Not reviewed", ledgerBalanceAtDate: balance, ...adjusted, notes: r.status, bankEvidenceVerified: false };
  });
  const checks = accountingChecks(ledger, { proceeding: String(estate.data?.proceeding_type ?? ""), administration: String(estate.data?.administration_type ?? ""), classificationComplete: ledger.receipts.every(r => r.source !== "other") && ledger.disbursements.every(d => d.kind !== "other"), bankFeedVerified: false, pooledCoverageVerified: false, today: new Date().toISOString().slice(0, 10) });
  ledger.assessmentBlockers = [
    ...(!estateId ? ["Select an estate."] : []),
    ...(isLoading ? ["Trust records are loading."] : []),
    ...(error ? ["Trust records could not be loaded."] : []),
    ...(!account ? ["No estate trust account is linked."] : []),
    "Distribution reserves and claim holdbacks have not been verified.",
    ...(!reconciliations.data?.some(r => r.status === "Approved" && r.statement_end) ? ["No reviewed reconciliation is on file."] : []),
    ...checks.filter(c => c.status !== "met").map(c => `${c.title}: ${c.detail}`),
  ];
  return { ledger, balances: computeBalances(ledger), checks, bankLines: matches.data ?? [], reconciliationRecords: reconciliations.data ?? [], isLoading, error };
}