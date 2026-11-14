// Claims register and day-one notice rules. Deadlines count from recorded dates only; missing dates abstain.
export type ClaimDecision = "admitted" | "partially_disallowed" | "disallowed";
export type NoticeKind = "s102_creditor_notice" | "s66_14_report" | "s135_disallowance";

export interface DecisionInput { decision: ClaimDecision; filedAmount: number; admittedAmount: number; reason: string }

export function validateDecision(d: DecisionInput): string[] {
  const errors: string[] = [];
  if (d.admittedAmount < 0) errors.push("Admitted amount cannot be negative.");
  if (d.admittedAmount > d.filedAmount) errors.push("Admitted amount cannot exceed the amount claimed.");
  if (d.decision === "disallowed" && d.admittedAmount !== 0) errors.push("A full disallowance admits $0.");
  if (d.decision === "admitted" && d.admittedAmount <= 0) errors.push("Enter the admitted amount.");
  if (d.decision === "partially_disallowed" && (d.admittedAmount <= 0 || d.admittedAmount >= d.filedAmount))
    errors.push("A partial disallowance admits more than $0 and less than the amount claimed.");
  if (d.decision !== "admitted" && d.reason.trim().length < 5) errors.push("Write the reason for disallowance (BIA s.135).");
  return errors;
}

const addDays = (iso: string, n: number) => {
  const t = new Date(`${iso}T00:00:00Z`); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10);
};

export interface DayOneNotice { kind: NoticeKind; label: string; rule: string; dueDate: string | null; blocker: string | null }

/** Bankruptcy: notice to creditors within 5 days of appointment (s.102). Consumer proposal: report within 10 days of filing (s.66.14). */
export function dayOneNotice(estateType: string | null, insolvencyDate: string | null, appointmentDate: string | null): DayOneNotice | null {
  const t = (estateType ?? "").toLowerCase();
  if (t.includes("bankrupt")) return {
    kind: "s102_creditor_notice", label: "Notice to creditors", rule: "BIA s.102 — within 5 days of the trustee's appointment",
    dueDate: appointmentDate ? addDays(appointmentDate, 5) : null,
    blocker: appointmentDate ? null : "Record the trustee appointment date to calculate this deadline.",
  };
  if (t.includes("proposal")) return {
    kind: "s66_14_report", label: "Administrator's report to OR and creditors", rule: "BIA s.66.14 — within 10 days of filing the proposal",
    dueDate: insolvencyDate ? addDays(insolvencyDate, 10) : null,
    blocker: insolvencyDate ? null : "Record the proposal filing date to calculate this deadline.",
  };
  return null;
}

export function noticeStatus(dueDate: string | null, sentDate: string | null, today: string): "sent" | "sent_late" | "overdue" | "due" | "not_checked" {
  if (sentDate) return dueDate && sentDate > dueDate ? "sent_late" : "sent";
  if (!dueDate) return "not_checked";
  return today > dueDate ? "overdue" : "due";
}
