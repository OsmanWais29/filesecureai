// Phase 9 — deterministic compliance rule engine. Never fed by AI output.
import { useMemo } from "react";
import { useEstateDates } from "@/hooks/useEstateRecords";
import { useEstateMilestones } from "@/hooks/useEstateMilestones";
import { useEstateIncomePeriods } from "@/hooks/useEstateIncome";
import { useEstateCreditors } from "@/hooks/useEstateCreditors";
import { useEstateAssets } from "@/hooks/useEstateAssets";
import { useCounsellingSessions } from "@/hooks/useEstateStatutory";
import { useTrustPosition, useReceipts, useDisbursements } from "@/hooks/useEstateAccounting";
import { useEstateRow } from "@/hooks/useEstateRecords";

export type ComplianceState = "pass" | "warn" | "fail";

export interface ComplianceRule {
  id: string;
  rule: string;
  source: string;
  state: ComplianceState;
  detail: string;
  due?: string | null;
}

export const useEstateCompliance = (estateId?: string) => {
  const { data: estate } = useEstateRow(estateId);
  const { data: dates = [] } = useEstateDates(estateId);
  const { milestones, blockers } = useEstateMilestones(estateId);
  const { data: income = [] } = useEstateIncomePeriods(estateId);
  const { data: creditors = [] } = useEstateCreditors(estateId);
  const { data: assets = [] } = useEstateAssets(estateId);
  const { data: sessions = [] } = useCounsellingSessions(estateId);
  const { data: receipts = [] } = useReceipts(estateId);
  const { data: disbursements = [] } = useDisbursements(estateId);
  const trust = useTrustPosition(estateId);

  const rules = useMemo<ComplianceRule[]>(() => {
    const row = estate as Record<string, any> | null | undefined;
    const hasIdentity = Boolean(row?.debtor_name && row?.estate_type);
    const recordedDates = dates.filter((d) => d.date_value).length;
    const overdue = milestones.filter((m) => m.state === "overdue");
    const outstandingSurplus = income.reduce((s, p) => s + Number(p.outstanding || 0), 0);
    const completedSessions = sessions.filter((s) => s.completed).length;
    const unrealized = assets.filter((a) => !a.completed).length;
    const undeposited = receipts.filter((r) => !r.deposit_date).length;
    const uncleared = disbursements.filter((d) => !d.cleared).length;

    return [
      {
        id: "identity",
        rule: "Estate identity complete",
        source: "OSB Directive 1R",
        state: hasIdentity ? "pass" : "fail",
        detail: hasIdentity
          ? "Debtor identity and estate classification recorded."
          : "Debtor name and estate type must be recorded on the estate record.",
      },
      {
        id: "dates",
        rule: "Significant dates recorded",
        source: "BIA s.49 / s.66.13",
        state: recordedDates >= 3 ? "pass" : recordedDates > 0 ? "warn" : "fail",
        detail: `${recordedDates} statutory date${recordedDates === 1 ? "" : "s"} recorded in the register.`,
      },
      {
        id: "milestones",
        rule: "No overdue statutory milestones",
        source: "Milestone engine",
        state: overdue.length ? "fail" : blockers.length ? "warn" : "pass",
        detail: overdue.length
          ? `${overdue.length} milestone(s) past due: ${overdue.map((m) => m.label).join(", ")}`
          : `${blockers.length} blocking milestone(s) still open.`,
        due: overdue[0]?.dueDate ?? null,
      },
      {
        id: "income",
        rule: "Form 65 income statements current",
        source: "BIA s.68 · Directive 11R2",
        state: income.length === 0 ? "fail" : outstandingSurplus > 0 ? "warn" : "pass",
        detail:
          income.length === 0
            ? "No monthly income and expense statements recorded."
            : `${income.length} period(s) recorded · $${outstandingSurplus.toFixed(2)} surplus outstanding.`,
      },
      {
        id: "counselling",
        rule: "Statutory counselling completed",
        source: "BIA s.157.1 · Directive 1R3",
        state: completedSessions >= 2 ? "pass" : completedSessions === 1 ? "warn" : "fail",
        detail: `${completedSessions} of 2 required sessions completed.`,
      },
      {
        id: "creditors",
        rule: "Creditor register populated",
        source: "BIA s.102",
        state: creditors.length ? "pass" : "fail",
        detail: creditors.length
          ? `${creditors.length} creditor(s) on the estate register.`
          : "No creditors recorded for this estate.",
      },
      {
        id: "assets",
        rule: "Assets fully realized",
        source: "BIA s.16(3)",
        state: assets.length === 0 ? "warn" : unrealized ? "warn" : "pass",
        detail: assets.length
          ? `${assets.length - unrealized} of ${assets.length} asset(s) realized.`
          : "No assets recorded.",
      },
      {
        id: "reconciliation",
        rule: "Trust items cleared and reconciled",
        source: "Directive 5R",
        state: undeposited || uncleared ? "warn" : "pass",
        detail: `${undeposited} undeposited receipt(s), ${uncleared} uncleared disbursement(s). Trust balance $${trust.balance.toFixed(2)}.`,
      },
    ];
  }, [estate, dates, milestones, blockers, income, creditors, assets, sessions, receipts, disbursements, trust.balance]);

  const failing = rules.filter((r) => r.state === "fail");
  const warning = rules.filter((r) => r.state === "warn");

  return {
    rules,
    failing,
    warning,
    passing: rules.filter((r) => r.state === "pass"),
    score: Math.round((rules.filter((r) => r.state === "pass").length / rules.length) * 100),
  };
};