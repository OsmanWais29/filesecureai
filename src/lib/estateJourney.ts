import type { RecordValues } from "@/components/estate/forms/RecordForm";

export const COUNSELLING_SOURCE = "https://www.ised-isde.canada.ca/site/office-superintendent-bankruptcy/en/directive-no-1r8-counselling-insolvency-matters";
const addDays = (date: string, days: number) => {
  const d = new Date(`${date}T12:00:00Z`);
  if (!Number.isFinite(d.getTime())) return null;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
export function counsellingWindow(anchor: string | null, first: string | null) {
  return { firstFrom: anchor ? addDays(anchor, 10) : null, firstThrough: anchor ? addDays(anchor, 90) : null, secondFrom: first ? addDays(first, 30) : null };
}
export function sessionHasEvidence(s: { appointment_date: string | null; counsellor: string | null; source_document: string | null; refused: boolean; neglected: boolean }) {
  return !!s.appointment_date && !!s.counsellor?.trim() && !!s.source_document?.trim() && s.source_document !== "None" && !s.refused && !s.neglected;
}
export function counsellingEvidence(sessions: Array<{ session_number: string | null; completed: boolean; appointment_date: string | null; counsellor: string | null; source_document: string | null; refused: boolean; neglected: boolean }>) {
  return ["First session (Stage 1)", "Second session (Stage 2)"].every(stage => sessions.some(s => s.session_number === stage && s.completed && sessionHasEvidence(s)));
}
export function assessmentErrors(v: RecordValues): string[] {
  const errors = ["assessed_on", "assessor", "options_explained", "recommendation", "evidence_reference", "supervising_lit"].filter(k => !String(v[k] ?? "").trim()).map(k => `Complete ${k.replace(/_/g, " ")}.`);
  if (v.signed_off && (!v.id_verified || !v.prior_insolvency_checked || !v.debtor_acknowledged)) errors.push("Sign-off requires identity verification, prior-insolvency review and debtor acknowledgement.");
  return errors;
}