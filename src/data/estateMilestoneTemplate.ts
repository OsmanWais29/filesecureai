/**
 * Deterministic milestone template (Phase 2).
 *
 * A milestone is derived, never typed: its due date is `anchor date + offset`
 * where the anchor is a row in the canonical `estate_dates` register. Changing
 * an anchor date therefore recalculates every dependent milestone.
 */
export interface MilestoneDefinition {
  code: string;
  stage: "Intake" | "Filing" | "Administration" | "Discharge" | "Closing";
  label: string;
  /** Must match a `statutoryDates` label — that is the `date_type` in estate_dates. */
  anchorDateType?: string;
  offsetDays?: number;
  blocking: boolean;
  statutoryReference?: string;
}

export const MILESTONE_TEMPLATE: MilestoneDefinition[] = [
  { code: "intake.signup", stage: "Intake", label: "Signup completed", anchorDateType: "Signup Date", offsetDays: 0, blocking: false },
  { code: "intake.assessment", stage: "Intake", label: "Initial assessment documented", anchorDateType: "Signup Date", offsetDays: 5, blocking: false },
  { code: "filing.assignment", stage: "Filing", label: "Assignment filed with OSB", anchorDateType: "Date Assignment Filed", offsetDays: 0, blocking: true, statutoryReference: "BIA s.49" },
  { code: "filing.notice", stage: "Filing", label: "Notice of bankruptcy mailed to creditors", anchorDateType: "Insolvency Date", offsetDays: 5, blocking: true, statutoryReference: "BIA s.102(1)" },
  { code: "filing.first_meeting", stage: "Filing", label: "First meeting of creditors held", anchorDateType: "Insolvency Date", offsetDays: 21, blocking: false, statutoryReference: "BIA s.102(1)" },
  { code: "admin.counselling_1", stage: "Administration", label: "First counselling session (Stage 1)", anchorDateType: "Insolvency Date", offsetDays: 101, blocking: true, statutoryReference: "Directive 1R4" },
  { code: "admin.counselling_2", stage: "Administration", label: "Second counselling session (Stage 2)", anchorDateType: "Insolvency Date", offsetDays: 184, blocking: true, statutoryReference: "Directive 1R4" },
  { code: "admin.poc_deadline", stage: "Administration", label: "Final proof of claim deadline", anchorDateType: "Final Proof of Claim Required by Creditor", offsetDays: 0, blocking: false },
  { code: "admin.tax_return", stage: "Administration", label: "Pre-bankruptcy tax return filed", anchorDateType: "Insolvency Date", offsetDays: 90, blocking: false },
  { code: "admin.assets", stage: "Administration", label: "Assets fully realized", blocking: true },
  { code: "discharge.s170", stage: "Discharge", label: "Section 170 report (Form 82) completed", anchorDateType: "Automatic Discharge Eligible", offsetDays: -30, blocking: true, statutoryReference: "BIA s.170" },
  { code: "discharge.eligible", stage: "Discharge", label: "Automatic discharge eligible", anchorDateType: "Automatic Discharge Eligible", offsetDays: 0, blocking: false, statutoryReference: "BIA s.168.1" },
  { code: "closing.final_rd", stage: "Closing", label: "Final statement of receipts & disbursements", anchorDateType: "Trustee Discharge Date", offsetDays: -60, blocking: true },
  { code: "closing.zero_balance", stage: "Closing", label: "Trust balance reduced to zero", blocking: true },
  { code: "closing.trustee_discharge", stage: "Closing", label: "Trustee discharged", anchorDateType: "Trustee Discharge Date", offsetDays: 0, blocking: false },
];

export const MILESTONE_STAGES = ["Intake", "Filing", "Administration", "Discharge", "Closing"] as const;

export const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};