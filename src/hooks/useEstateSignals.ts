// Derived estate intelligence. Every signal, count and score on this hook comes
// from persisted estate records — nothing here is hard-coded. When the estate
// does not hold enough information, the hook abstains instead of returning zero.
import { useMemo } from "react";
import {
  Computed,
  Dependency,
  EstateLocation,
  blocked,
  computed,
} from "@/data/estateFieldState";
import { useEstateDates, useEstateRow } from "@/hooks/useEstateRecords";
import { useEstateMilestones } from "@/hooks/useEstateMilestones";
import { useEstateCreditors } from "@/hooks/useEstateCreditors";
import { useEstateIncomePeriods } from "@/hooks/useEstateIncome";
import { useCounsellingSessions } from "@/hooks/useEstateStatutory";
import { useReceipts, useDisbursements } from "@/hooks/useEstateAccounting";
import { useReconciliations } from "@/hooks/useEstateSchedules";

export type SignalSeverity = "exception" | "warning" | "insight";

export interface EstateSignal {
  id: string;
  severity: SignalSeverity;
  /** Reason-bearing status: Blocked, Waiting, Overdue, Human Decision Required… */
  status: string;
  title: string;
  detail: string;
  /** Deterministic origin of the signal — never an AI assertion. */
  source: string;
  to: EstateLocation;
}

const money = (n: number) =>
  `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const RECORD_DETAILS: EstateLocation = { module: "record", page: "details" };

export const useEstateSignals = (estateId?: string) => {
  const { data: row, isLoading: loadingRow } = useEstateRow(estateId);
  const { data: dates = [], isLoading: loadingDates } = useEstateDates(estateId);
  const { milestones, isLoading: loadingMilestones } = useEstateMilestones(estateId);
  const { data: creditors = [] } = useEstateCreditors(estateId);
  const { data: income = [] } = useEstateIncomePeriods(estateId);
  const { data: sessions = [] } = useCounsellingSessions(estateId);
  const { data: receipts = [] } = useReceipts(estateId);
  const { data: disbursements = [] } = useDisbursements(estateId);
  const { data: reconciliations = [] } = useReconciliations(estateId);

  const isLoading = loadingRow || loadingDates || loadingMilestones;

  return useMemo(() => {
    const record = (row ?? {}) as Record<string, any>;
    const dateValue = (type: string) =>
      dates.find((d) => d.date_type === type)?.date_value ?? null;

    const insolvencyDate = record.insolvency_date ?? dateValue("Date of Insolvency") ?? null;

    /** Foundational inputs every downstream engine depends on. */
    const missing: Dependency[] = [];
    if (!record.debtor_name || !record.estate_type) {
      missing.push({ label: "Debtor identity and estate type", to: RECORD_DETAILS });
    }
    if (!insolvencyDate) missing.push({ label: "Date of insolvency", to: RECORD_DETAILS });
    if (creditors.length === 0) {
      missing.push({ label: "Creditor records", to: { module: "creditors", page: "register" } });
    }

    const canAssess = missing.length === 0;

    const signals: EstateSignal[] = [];

    // --- Statutory milestones -------------------------------------------------
    milestones
      .filter((m) => m.state === "overdue")
      .forEach((m) =>
        signals.push({
          id: `milestone-overdue-${m.code}`,
          severity: "exception",
          status: "Overdue",
          title: m.label,
          detail: `Due ${m.dueDate}. ${m.statutoryReference ?? ""}`.trim(),
          source: "Rule engine · milestone",
          to: { module: "workflow", page: "milestones", focus: m.code },
        })
      );

    milestones
      .filter((m) => m.anchorMissing && m.state !== "complete")
      .slice(0, 3)
      .forEach((m) =>
        signals.push({
          id: `milestone-blocked-${m.code}`,
          severity: "warning",
          status: "Blocked",
          title: `${m.label} — due date cannot be calculated`,
          detail: `Missing anchor: ${m.anchorDateType}.`,
          source: "Rule engine · milestone",
          to: RECORD_DETAILS,
        })
      );

    // --- Creditor claim variances --------------------------------------------
    creditors
      .filter((c) => Number(c.filed_amount || 0) !== Number(c.soa_amount || 0) && c.poc_filed)
      .forEach((c) => {
        const delta = Number(c.filed_amount || 0) - Number(c.soa_amount || 0);
        signals.push({
          id: `claim-variance-${c.id}`,
          severity: "warning",
          status: "Human Decision Required",
          title: `${c.legal_name} claim differs by ${money(Math.abs(delta))}`,
          detail: `Statement of affairs ${money(Number(c.soa_amount || 0))} · filed proof ${money(
            Number(c.filed_amount || 0)
          )}.`,
          source: "Rule engine · claim comparison",
          to: { module: "creditors", page: "claims", focus: c.id },
        });
      });

    // --- Income & surplus -----------------------------------------------------
    income
      .filter((p) => Number(p.outstanding || 0) > 0)
      .forEach((p) =>
        signals.push({
          id: `income-outstanding-${p.id}`,
          severity: "warning",
          status: "Overdue",
          title: `${money(Number(p.outstanding))} surplus outstanding`,
          detail: `Period ${p.period_label ?? p.period_start ?? ""}.`.trim(),
          source: "Rule engine · BIA s.68",
          to: { module: "financials", page: "income", focus: String(p.id) },
        })
      );

    // --- Trust accounting -----------------------------------------------------
    reconciliations
      .filter((r: any) => String(r.status ?? "").toLowerCase() !== "approved")
      .forEach((r: any) =>
        signals.push({
          id: `recon-${r.id}`,
          severity: "exception",
          status: "Waiting",
          title: `${r.statement_end ?? "Bank"} reconciliation outstanding`,
          detail:
            Number(r.difference || 0) !== 0
              ? `Unreconciled difference ${money(Number(r.difference))}.`
              : "Reconciliation has not been completed.",
          source: "Rule engine · Directive 5R",
          to: { module: "financials", page: "trust", focus: String(r.id) },
        })
      );

    const undeposited = receipts.filter((r: any) => !r.deposit_date).length;
    if (undeposited) {
      signals.push({
        id: "receipts-undeposited",
        severity: "warning",
        status: "Waiting",
        title: `${undeposited} receipt(s) not deposited`,
        detail: "Undeposited trust receipts block the bank reconciliation.",
        source: "Rule engine · trust accounting",
        to: { module: "financials", page: "trust" },
      });
    }

    const uncleared = disbursements.filter((d: any) => !d.cleared).length;
    if (uncleared) {
      signals.push({
        id: "disbursements-uncleared",
        severity: "warning",
        status: "Waiting",
        title: `${uncleared} disbursement(s) uncleared`,
        detail: "Outstanding payments must clear before the period reconciles.",
        source: "Rule engine · trust accounting",
        to: { module: "financials", page: "trust" },
      });
    }

    // --- Foundational gaps ----------------------------------------------------
    missing.forEach((m, i) =>
      signals.push({
        id: `missing-${i}`,
        severity: "exception",
        status: "Blocked",
        title: `${m.label} not recorded`,
        detail: "Workflow, surplus and compliance calculations depend on this value.",
        source: "Estate record",
        to: m.to ?? RECORD_DETAILS,
      })
    );

    // --- Estate health --------------------------------------------------------
    // Derived only from measurable conditions; abstains while foundations are missing.
    const components = [
      { label: "Foundational estate record complete", ok: canAssess },
      { label: "No overdue milestones", ok: !milestones.some((m) => m.state === "overdue") },
      { label: "All milestone anchors available", ok: !milestones.some((m) => m.anchorMissing) },
      { label: "No surplus arrears", ok: !income.some((p) => Number(p.outstanding || 0) > 0) },
      { label: "Counselling on track", ok: sessions.filter((s: any) => s.completed).length >= 1 },
      { label: "Trust items cleared", ok: undeposited === 0 && uncleared === 0 },
      {
        label: "No unresolved claim variances",
        ok: !creditors.some(
          (c) => c.poc_filed && Number(c.filed_amount || 0) !== Number(c.soa_amount || 0)
        ),
      },
    ];

    const health: Computed<number> = canAssess
      ? computed(Math.round((components.filter((c) => c.ok).length / components.length) * 100), {
          ruleId: "estate.health",
          ruleVersion: "1.0.0",
          inputs: components.map((c) => ({ label: c.label, value: c.ok ? "pass" : "fail" })),
        })
      : blocked<number>(missing, { ruleId: "estate.health", ruleVersion: "1.0.0" });

    const exceptions = signals.filter((s) => s.severity === "exception");
    const warnings = signals.filter((s) => s.severity === "warning");

    return {
      isLoading,
      canAssess,
      missing,
      signals,
      exceptions,
      warnings,
      openSignals: exceptions.length + warnings.length,
      health,
      healthComponents: components,
      insolvencyDate,
    };
  }, [
    row,
    dates,
    milestones,
    creditors,
    income,
    sessions,
    receipts,
    disbursements,
    reconciliations,
    isLoading,
  ]);
};

/**
 * Navigation badge counts. Only actionable/open items are counted — a module
 * with nothing outstanding intentionally returns no badge.
 */
export const useEstateNavBadges = (estateId?: string) => {
  const { signals } = useEstateSignals(estateId);

  return useMemo(() => {
    const modules: Record<string, number> = {};
    const pages: Record<string, number> = {};
    signals
      .filter((s) => s.severity !== "insight")
      .forEach((s) => {
        modules[s.to.module] = (modules[s.to.module] ?? 0) + 1;
        const key = `${s.to.module}:${s.to.page}`;
        pages[key] = (pages[key] ?? 0) + 1;
      });
    return { modules, pages };
  }, [signals]);
};