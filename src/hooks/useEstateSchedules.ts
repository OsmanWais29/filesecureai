// Phase 4 — payment schedules, PAD runs and bank reconciliation.
// Schedule rows are *generated* from the schedule definition, never typed by
// hand, so the projected trust inflow always matches the mandate on file.
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

export interface ScheduleRow {
  id: string;
  schedule_id: string;
  period_index: number;
  due_date: string;
  amount_due: number;
  amount_received: number;
  amount_deposited: number;
  pad_state: string;
  pad_run_id: string | null;
}

export interface PaymentSchedule {
  id: string;
  schedule_type: string | null;
  payment_category: string | null;
  period_type: string | null;
  start_date: string | null;
  end_date: string | null;
  number_of_periods: number | null;
  amount_per_payment: number;
  incremental_monthly: number;
  gl_account: string | null;
  pad_enabled: boolean;
  mandate_reference: string | null;
  first_debit_date: string | null;
  active: boolean;
}

export interface PadRun {
  id: string;
  run_date: string;
  state: string;
  item_count: number;
  total_amount: number;
  file_format: string | null;
  submitted_at: string | null;
}

export interface ReconciliationRecord {
  id: string;
  statement_start: string | null;
  statement_end: string | null;
  opening_statement_balance: number;
  closing_statement_balance: number;
  ledger_balance: number;
  deposits_in_transit: number;
  outstanding_withdrawals: number;
  bank_charges: number;
  interest: number;
  reconciled_balance: number;
  difference: number;
  preparer: string | null;
  reviewer: string | null;
  approval_date: string | null;
  status: string;
}

// ------------------------------------------------------------ period arithmetic
const PERIOD_STEP: Record<string, { months?: number; days?: number }> = {
  Weekly: { days: 7 },
  "Bi-weekly": { days: 14 },
  "Semi-monthly": { days: 15 },
  Monthly: { months: 1 },
  Quarterly: { months: 3 },
  Annually: { months: 12 },
};

const advance = (iso: string, periodType: string, steps: number) => {
  const step = PERIOD_STEP[periodType] ?? PERIOD_STEP.Monthly;
  const d = new Date(`${iso}T00:00:00Z`);
  if (step.months) d.setUTCMonth(d.getUTCMonth() + step.months * steps);
  else d.setUTCDate(d.getUTCDate() + (step.days ?? 30) * steps);
  return d.toISOString().slice(0, 10);
};

/** Deterministic projection of a schedule into its individual period rows. */
export const projectScheduleRows = (values: RecordValues) => {
  const start = str(values.startDate);
  const periods = Math.max(0, Math.trunc(num(values.numberOfPeriods)));
  const base = num(values.amountPerPayment);
  const increment = num(values.incrementalMonthly);
  const periodType = str(values.periodType) ?? "Monthly";
  if (!start || periods === 0 || base <= 0) return [];
  return Array.from({ length: periods }, (_, i) => ({
    period_index: i + 1,
    due_date: advance(start, periodType, i),
    amount_due: Number((base + increment * i).toFixed(2)),
  }));
};

// ------------------------------------------------------------------- schedules
export const usePaymentSchedules = (estateId?: string) =>
  useQuery({
    queryKey: ["estate_payment_schedules", estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<PaymentSchedule[]> => {
      const { data, error } = await db
        .from("estate_payment_schedules")
        .select("*")
        .eq("estate_id", estateId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PaymentSchedule[];
    },
  });

export const useScheduleRows = (estateId?: string) =>
  useQuery({
    queryKey: ["estate_schedule_rows", estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<ScheduleRow[]> => {
      const { data, error } = await db
        .from("estate_schedule_rows")
        .select("*")
        .eq("estate_id", estateId)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ScheduleRow[];
    },
  });

export const useGenerateSchedule = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: RecordValues) => {
      if (!estateId) throw new Error("No estate selected.");
      const rows = projectScheduleRows(values);
      if (!rows.length) {
        throw new Error("A start date, period count and payment amount are required.");
      }
      const user = await requireUser();
      const { data: schedule, error } = await db
        .from("estate_payment_schedules")
        .insert({
          estate_id: estateId,
          user_id: user.id,
          schedule_type: str(values.scheduleType),
          payment_category: str(values.paymentCategory),
          period_type: str(values.periodType),
          start_date: str(values.startDate),
          end_date: str(values.endDate) ?? rows[rows.length - 1].due_date,
          number_of_periods: rows.length,
          amount_per_payment: num(values.amountPerPayment),
          incremental_monthly: num(values.incrementalMonthly),
          asset_ref: str(values.asset),
          gl_account: str(values.glAccount),
          pad_enabled: bool(values.padEnabled),
          mandate_reference: str(values.mandateReference),
          first_debit_date: str(values.firstDebitDate),
          grace_period_days: values.gracePeriodDays ? num(values.gracePeriodDays) : null,
          comments: str(values.comments),
        })
        .select()
        .single();
      if (error) throw error;

      const { error: rowError } = await db.from("estate_schedule_rows").insert(
        rows.map((r) => ({
          ...r,
          schedule_id: schedule.id,
          estate_id: estateId,
          user_id: user.id,
        }))
      );
      if (rowError) throw rowError;

      await logEstateEvent({ estateId, eventType: "estate.schedule.generated", after: schedule });
      return schedule as PaymentSchedule;
    },
    onSuccess: (schedule) => {
      qc.invalidateQueries({ queryKey: ["estate_payment_schedules", estateId] });
      qc.invalidateQueries({ queryKey: ["estate_schedule_rows", estateId] });
      toast({
        title: "Schedule generated",
        description: `${schedule.number_of_periods} periods projected from the mandate.`,
      });
    },
    onError: (e: Error) =>
      toast({ title: "Could not generate schedule", description: e.message, variant: "destructive" }),
  });
};

export const useUpdateScheduleRow = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; patch: Partial<ScheduleRow> }) => {
      const { error } = await db.from("estate_schedule_rows").update(input.patch).eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate_schedule_rows", estateId] });
    },
    onError: (e: Error) =>
      toast({ title: "Could not update period", description: e.message, variant: "destructive" }),
  });
};

// -------------------------------------------------------------------- PAD runs
export const usePadRuns = (estateId?: string) =>
  useQuery({
    queryKey: ["estate_pad_runs", estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<PadRun[]> => {
      const { data, error } = await db
        .from("estate_pad_runs")
        .select("*")
        .eq("estate_id", estateId)
        .order("run_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PadRun[];
    },
  });

/** Collects every pending PAD-enabled period due on/before the run date. */
export const useCreatePadRun = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { runDate: string; rows: ScheduleRow[]; bankAccountId?: string | null }) => {
      if (!estateId) throw new Error("No estate selected.");
      if (!input.rows.length) throw new Error("No pending pre-authorized debits are due.");
      const user = await requireUser();
      const total = input.rows.reduce((s, r) => s + Number(r.amount_due || 0), 0);
      const { data: run, error } = await db
        .from("estate_pad_runs")
        .insert({
          estate_id: estateId,
          user_id: user.id,
          bank_account_id: input.bankAccountId ?? null,
          run_date: input.runDate,
          state: "submitted",
          item_count: input.rows.length,
          total_amount: total,
          file_format: "CPA 005",
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;

      const { error: rowError } = await db
        .from("estate_schedule_rows")
        .update({ pad_state: "submitted", pad_run_id: run.id })
        .in("id", input.rows.map((r) => r.id));
      if (rowError) throw rowError;

      await logEstateEvent({ estateId, eventType: "estate.pad_run.submitted", after: run });
      return run as PadRun;
    },
    onSuccess: (run) => {
      qc.invalidateQueries({ queryKey: ["estate_pad_runs", estateId] });
      qc.invalidateQueries({ queryKey: ["estate_schedule_rows", estateId] });
      toast({ title: "PAD run submitted", description: `${run.item_count} debits queued.` });
    },
    onError: (e: Error) =>
      toast({ title: "Could not create PAD run", description: e.message, variant: "destructive" }),
  });
};

// -------------------------------------------------------------- reconciliation
export const useReconciliations = (estateId?: string) =>
  useQuery({
    queryKey: ["estate_reconciliations", estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<ReconciliationRecord[]> => {
      const { data, error } = await db
        .from("estate_reconciliations")
        .select("*")
        .eq("estate_id", estateId)
        .order("statement_end", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as ReconciliationRecord[];
    },
  });

/** Reconciled balance and difference are derived — never typed by the user. */
export const deriveReconciliation = (values: RecordValues) => {
  const closing = num(values.closingStatementBalance);
  const reconciled =
    closing +
    num(values.depositsInTransit) -
    num(values.outstandingWithdrawals) -
    num(values.bankCharges) +
    num(values.interest);
  const difference = Number((reconciled - num(values.ledgerBalance)).toFixed(2));
  return { reconciled: Number(reconciled.toFixed(2)), difference };
};

export const useSaveReconciliation = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { values: RecordValues; bankAccountId?: string | null }) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      const { values } = input;
      const { reconciled, difference } = deriveReconciliation(values);
      const status = str(values.status) ?? "Draft";
      if (status === "Approved" && Math.abs(difference) > 0.005) {
        throw new Error("A reconciliation cannot be approved while a difference remains.");
      }
      const { data, error } = await db
        .from("estate_reconciliations")
        .insert({
          estate_id: estateId,
          user_id: user.id,
          bank_account_id: input.bankAccountId ?? null,
          statement_start: str(values.statementStart),
          statement_end: str(values.statementEnd),
          opening_statement_balance: num(values.openingStatementBalance),
          closing_statement_balance: num(values.closingStatementBalance),
          ledger_balance: num(values.ledgerBalance),
          deposits_in_transit: num(values.depositsInTransit),
          outstanding_withdrawals: num(values.outstandingWithdrawals),
          bank_charges: num(values.bankCharges),
          interest: num(values.interest),
          reconciled_balance: reconciled,
          difference,
          preparer: str(values.preparer),
          reviewer: str(values.reviewer),
          approval_date: str(values.approvalDate),
          status,
        })
        .select()
        .single();
      if (error) throw error;
      await logEstateEvent({ estateId, eventType: "estate.reconciliation.saved", after: data });
      return data as ReconciliationRecord;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate_reconciliations", estateId] });
      toast({ title: "Reconciliation saved" });
    },
    onError: (e: Error) =>
      toast({ title: "Could not save reconciliation", description: e.message, variant: "destructive" }),
  });
};