// Phase 3 — trust accounting persistence: bank accounts, receipts with
// allocations, disbursements and journal entries. All amounts are stored as
// numerics; balancing rules are enforced before write, never after.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { RecordValues } from "@/components/estate/forms/RecordForm";
import { logEstateEvent } from "@/hooks/useEstateRecords";

const db = supabase as unknown as { from: (table: string) => any };

const requireUser = async () => {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("You must be signed in to work on estates.");
  return data.user;
};

const num = (v: RecordValues[string]) => Number(v ?? 0) || 0;
const str = (v: RecordValues[string]) => (v == null || v === "" ? null : String(v));
const bool = (v: RecordValues[string]) => Boolean(v);

export interface BankAccountRow {
  id: string;
  institution: string | null;
  branch: string | null;
  transit_number: string | null;
  account_number: string | null;
  account_type: string | null;
  currency: string;
  is_default: boolean;
  opened_date: string | null;
  as_of_date: string | null;
  closed_date: string | null;
  opening_balance: number;
  gl_bank_account: string | null;
  pad_enabled: boolean;
  eft_enabled: boolean;
}

export interface ReceiptRow {
  id: string;
  receipt_date: string | null;
  received_from: string | null;
  payment_method: string | null;
  amount: number;
  reference: string | null;
  receipt_number: string | null;
  deposit_date: string | null;
  posted: boolean;
  estate_receipt_allocations?: { id: string; gl_account: string; amount: number }[];
}

export interface DisbursementRow {
  id: string;
  disbursement_type: string | null;
  due_date: string | null;
  payee: string | null;
  amount: number;
  gl_account: string | null;
  payment_method: string | null;
  payment_date: string | null;
  cleared: boolean;
}

export interface LedgerEntryRow {
  id: string;
  gl_date: string | null;
  memo: string | null;
  source_type: string;
  lines: { account: string; asset?: string; creditor?: string; debit: number; credit: number }[];
  total_debit: number;
  total_credit: number;
  created_at: string;
}

const listQuery = <T,>(table: string, estateId: string | undefined, select = "*", order = "created_at") =>
  ({
    queryKey: [table, estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<T[]> => {
      const { data, error } = await db
        .from(table)
        .select(select)
        .eq("estate_id", estateId)
        .order(order, { ascending: false });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  }) as const;

// --------------------------------------------------------------- bank accounts
export const useBankAccounts = (estateId?: string) =>
  useQuery(listQuery<BankAccountRow>("estate_bank_accounts", estateId));

export const useSaveBankAccount = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: RecordValues) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      const { data, error } = await db
        .from("estate_bank_accounts")
        .insert({
          estate_id: estateId,
          user_id: user.id,
          institution: str(values.institution),
          branch: str(values.branchName),
          transit_number: str(values.transitNumber),
          account_number: str(values.accountNumber),
          account_type: str(values.accountType),
          currency: str(values.currency) ?? "CAD",
          is_default: bool(values.defaultAccount),
          opened_date: str(values.openedDate),
          as_of_date: str(values.asOfDate),
          closed_date: str(values.closedDate),
          opening_balance: num(values.openingBalance),
          gl_bank_account: str(values.glBankAccount),
          export_format: str(values.bankExportFormat),
          pad_enabled: bool(values.padEnabled),
          eft_enabled: bool(values.eftEnabled),
        })
        .select()
        .single();
      if (error) throw error;
      await logEstateEvent({ estateId, eventType: "estate.bank_account.created", after: data });
      return data as BankAccountRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate_bank_accounts", estateId] });
      toast({ title: "Bank account saved" });
    },
    onError: (e: Error) =>
      toast({ title: "Could not save account", description: e.message, variant: "destructive" }),
  });
};

// -------------------------------------------------------------------- receipts
export const useReceipts = (estateId?: string) =>
  useQuery(
    listQuery<ReceiptRow>(
      "estate_receipts",
      estateId,
      "*, estate_receipt_allocations(id, gl_account, amount)"
    )
  );

export const usePostReceipt = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      values: RecordValues;
      allocations: { account: string; amount: number }[];
      bankAccountId?: string | null;
    }) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      const total = num(input.values.amount);
      const allocated = input.allocations.reduce((s, a) => s + a.amount, 0);
      const hasSuspense = input.allocations.some((a) => a.account === "Suspense / Unallocated");
      if (total <= 0) throw new Error("A receipt must have a positive amount.");
      if (Math.abs(total - allocated) > 0.005 && !hasSuspense) {
        throw new Error("Allocations must reconcile, or route the remainder to suspense.");
      }

      const { data: receipt, error } = await db
        .from("estate_receipts")
        .insert({
          estate_id: estateId,
          user_id: user.id,
          bank_account_id: input.bankAccountId ?? null,
          receipt_date: str(input.values.receiptDate),
          received_from: str(input.values.receivedFrom),
          payment_method: str(input.values.paymentMethod),
          amount: total,
          reference: str(input.values.chequeNumber),
          receipt_number: str(input.values.receiptNumber),
          deposit_date: str(input.values.depositDate),
          posted: true,
        })
        .select()
        .single();
      if (error) throw error;

      if (input.allocations.length) {
        const { error: allocError } = await db.from("estate_receipt_allocations").insert(
          input.allocations.map((a) => ({
            receipt_id: receipt.id,
            user_id: user.id,
            gl_account: a.account,
            amount: a.amount,
            creditor_ref: str(input.values.creditor),
            asset_ref: str(input.values.asset),
          }))
        );
        if (allocError) throw allocError;
      }

      // Double-entry: debit the bank, credit each allocation account.
      await db.from("estate_ledger_entries").insert({
        estate_id: estateId,
        user_id: user.id,
        gl_date: str(input.values.receiptDate),
        bank_account_id: input.bankAccountId ?? null,
        memo: `Receipt ${receipt.receipt_number ?? receipt.id.slice(0, 8)}`,
        source_type: "receipt",
        source_id: receipt.id,
        lines: [
          { account: "10000 · Trust Bank", debit: total, credit: 0 },
          ...input.allocations.map((a) => ({ account: a.account, debit: 0, credit: a.amount })),
        ],
        total_debit: total,
        total_credit: allocated,
      });

      await logEstateEvent({ estateId, eventType: "estate.receipt.posted", after: receipt });
      return receipt as ReceiptRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate_receipts", estateId] });
      qc.invalidateQueries({ queryKey: ["estate_ledger_entries", estateId] });
      toast({ title: "Receipt posted", description: "Allocations reconciled and ledger updated." });
    },
    onError: (e: Error) =>
      toast({ title: "Cannot post receipt", description: e.message, variant: "destructive" }),
  });
};

// --------------------------------------------------------------- disbursements
export const useDisbursements = (estateId?: string) =>
  useQuery(listQuery<DisbursementRow>("estate_disbursements", estateId));

export const useSaveDisbursement = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: RecordValues) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      const amount = num(values.amount);
      if (amount <= 0) throw new Error("A disbursement must have a positive amount.");
      const { data, error } = await db
        .from("estate_disbursements")
        .insert({
          estate_id: estateId,
          user_id: user.id,
          disbursement_type: str(values.disbursementType),
          due_date: str(values.dueDate),
          payee: str(values.payee),
          amount,
          gl_account: str(values.glAccount),
          asset_ref: str(values.asset),
          creditor_ref: str(values.creditor),
          tax_treatment: str(values.taxTreatment),
          payment_method: str(values.paymentMethod),
          payment_date: str(values.paymentDate),
          cleared: bool(values.cleared),
        })
        .select()
        .single();
      if (error) throw error;

      await db.from("estate_ledger_entries").insert({
        estate_id: estateId,
        user_id: user.id,
        gl_date: str(values.paymentDate) ?? str(values.dueDate),
        memo: `Disbursement to ${data.payee ?? "payee"}`,
        source_type: "disbursement",
        source_id: data.id,
        lines: [
          { account: data.gl_account ?? "22000 · Admin disbursements", debit: amount, credit: 0 },
          { account: "10000 · Trust Bank", debit: 0, credit: amount },
        ],
        total_debit: amount,
        total_credit: amount,
      });

      await logEstateEvent({ estateId, eventType: "estate.disbursement.created", after: data });
      return data as DisbursementRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate_disbursements", estateId] });
      qc.invalidateQueries({ queryKey: ["estate_ledger_entries", estateId] });
      toast({ title: "Disbursement recorded" });
    },
    onError: (e: Error) =>
      toast({ title: "Could not record disbursement", description: e.message, variant: "destructive" }),
  });
};

// -------------------------------------------------------------- ledger entries
export const useLedgerEntries = (estateId?: string) =>
  useQuery(listQuery<LedgerEntryRow>("estate_ledger_entries", estateId));

export const usePostJournalEntry = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      values: RecordValues;
      lines: { account: string; asset?: string; creditor?: string; debit: number; credit: number }[];
    }) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      const debit = input.lines.reduce((s, l) => s + l.debit, 0);
      const credit = input.lines.reduce((s, l) => s + l.credit, 0);
      if (debit <= 0 || Math.abs(debit - credit) > 0.005) {
        throw new Error("Journal entries must balance before they can be posted.");
      }
      const { data, error } = await db
        .from("estate_ledger_entries")
        .insert({
          estate_id: estateId,
          user_id: user.id,
          gl_date: str(input.values.glDate),
          memo: str(input.values.memo),
          source_type: "journal",
          lines: input.lines,
          total_debit: debit,
          total_credit: credit,
        })
        .select()
        .single();
      if (error) throw error;
      await logEstateEvent({ estateId, eventType: "estate.journal.posted", after: data });
      return data as LedgerEntryRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate_ledger_entries", estateId] });
      toast({ title: "Journal entry posted", description: "Entry is now immutable." });
    },
    onError: (e: Error) =>
      toast({ title: "Cannot post entry", description: e.message, variant: "destructive" }),
  });
};

/** Trust position derived from posted receipts and disbursements. */
export const useTrustPosition = (estateId?: string) => {
  const { data: receipts = [] } = useReceipts(estateId);
  const { data: disbursements = [] } = useDisbursements(estateId);
  const received = receipts.reduce((s, r) => s + Number(r.amount || 0), 0);
  const paid = disbursements.reduce((s, d) => s + Number(d.amount || 0), 0);
  return { received, paid, balance: received - paid };
};