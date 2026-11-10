import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBankAccounts, useLedgerEntries, useReceipts, useDisbursements } from "./useEstateAccounting";
import { useReconciliations } from "./useEstateSchedules";
import { ledgerFromPostings } from "@/lib/trust/persistedLedger";
import { computeBalances, reconcile, type TrustLedger } from "@/lib/trust/trustLedger";

export function useEstateTrustLedger(estateId?: string) {
  const accounts = useBankAccounts(estateId);
  const entries = useLedgerEntries(estateId);
  const receipts = useReceipts(estateId);
  const payments = useDisbursements(estateId);
  const reconciliations = useReconciliations(estateId);
  const matches = useQuery({
    queryKey: ["estate_statement_lines", estateId], enabled: Boolean(estateId),
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("estate_statement_lines").select("matched_receipt_id,match_state").eq("estate_id", estateId);
      if (error) throw error;
      return (data ?? []) as { matched_receipt_id: string | null; match_state: string }[];
    },
  });
  const queries = [accounts, entries, receipts, payments, reconciliations, matches];
  const isLoading = Boolean(estateId) && queries.some(q => q.isLoading);
  const error = queries.find(q => q.error)?.error;
  const ledger: TrustLedger = ledgerFromPostings(entries.data ?? []);
  const account = accounts.data?.find(a => a.is_default && !a.closed_date) ?? accounts.data?.find(a => !a.closed_date);
  if (account) ledger.account = { bank: account.institution ?? "Bank not recorded", last4: (account.account_number ?? "").slice(-4), holder: "Account holder not yet recorded", designation: "estate_specific", dualSignatureThreshold: null, openedOn: account.opened_date ?? "" };
  ledger.receipts = ledger.receipts.map(r => {
    const source = receipts.data?.find(s => s.id === r.sourceRef);
    return { ...r, payer: source?.received_from ?? r.payer, depositDate: source?.deposit_date ?? null, clearedOnStatement: Boolean(matches.data?.some(m => m.matched_receipt_id === source?.id && m.match_state === "matched")) };
  });
  ledger.disbursements = ledger.disbursements.map(d => {
    const source = payments.data?.find(s => s.id === d.reference);
    return { ...d, payee: source?.payee ?? d.payee, cleared: source?.cleared ?? false };
  });
  ledger.reconciliations = (reconciliations.data ?? []).filter(r => r.statement_end).map(r => {
    const balance = computeBalances(ledgerFromPostings(entries.data ?? [], r.statement_end ?? undefined)).ledgerBalance;
    const adjusted = reconcile(balance, Number(r.closing_statement_balance), Number(r.deposits_in_transit), Number(r.outstanding_withdrawals));
    return { id: r.id, statementDate: r.statement_end ?? "", statementBalance: Number(r.closing_statement_balance), reconciledOn: r.approval_date ?? "", reconciledBy: r.reviewer ?? "Not reviewed", ledgerBalanceAtDate: balance, ...adjusted, notes: r.status };
  });
  ledger.assessmentBlockers = [
    ...(!estateId ? ["Select an estate."] : []),
    ...(isLoading ? ["Trust records are loading."] : []),
    ...(error ? ["Trust records could not be loaded."] : []),
    ...(!account ? ["No estate trust account is linked."] : []),
    "Distribution reserves and claim holdbacks have not been verified.",
    ...(!reconciliations.data?.some(r => r.status === "Approved" && r.statement_end) ? ["No reviewed reconciliation is on file."] : []),
  ];
  return { ledger, balances: computeBalances(ledger), isLoading, error };
}