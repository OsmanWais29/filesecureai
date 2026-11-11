// Firm-wide filing plan: what each estate owes the OSB, derived from the form catalogue and recorded dates.
import { FORM_DEFS, adminType, deadlineDate, estateKind, formVersion, type FormDef } from "@/lib/forms/formEngine";

export interface PlanEstate { id: string; debtor_name: string; file_number: string | null; estate_type: string | null; insolvency_date: string | null; appointment_date: string | null; administration_type: string | null }
export interface PlanFiling { estate_id: string; form_number: string; status: string; created_at: string }
export interface PlanItem {
  key: string; estate: PlanEstate; def: FormDef; versionLabel: string; deadline: string | null;
  reason: string; blocker: string | null; period: string | null;
}
export interface PlanGap { estate: PlanEstate; form: string; month: string }

const month = (iso: string) => iso.slice(0, 7);
/** Forms with a one-time obligation; recurring/statement forms are handled by batches or the estate page. */
const ONE_TIME = ["Form 21", "Form 48", "Form 49", "Form 68", "Form 79"];

export const buildPlan = (estates: PlanEstate[], filings: PlanFiling[], today: string): PlanItem[] => {
  const out: PlanItem[] = [];
  for (const e of estates) {
    const kind = estateKind(e.estate_type);
    if (kind === "unknown") continue;
    const admin = adminType(e.administration_type);
    for (const def of FORM_DEFS) {
      if (!def.appliesTo.includes(kind)) continue;
      if (def.adminTypes && (!admin || !def.adminTypes.includes(admin))) continue;
      const mine = filings.filter((f) => f.estate_id === e.id && f.form_number === def.number);
      if (def.monthly) {
        if (mine.some((f) => month(f.created_at) === month(today))) continue;
      } else if (!ONE_TIME.includes(def.number) || mine.length) continue;
      const deadline = deadlineDate(def, e.insolvency_date, e.appointment_date);
      const missingAnchor = def.deadline && !deadline
        ? def.deadline.anchor === "appointment" ? "Trustee appointment date not recorded" : "Filing date not recorded" : null;
      const v = formVersion(e.insolvency_date);
      out.push({
        key: `${e.id}:${def.number}`, estate: e, def, versionLabel: v.label, deadline,
        reason: def.monthly ? `Monthly statement for ${today.slice(0, 7)}` : def.deadline ? `${def.deadline.label} (${def.deadline.citation})` : "Required for this estate type",
        blocker: missingAnchor ?? (!v.known ? "Filing date missing, form version unknown" : def.waitsOn === "debtor" ? "Needs the debtor's monthly figures" : null),
        period: def.monthly ? today.slice(0, 7) : null,
      });
    }
  }
  return out;
};

/** Months since the filing date with no Form 65 drafted (e.g. after importing from another system). */
export const form65Gaps = (estates: PlanEstate[], filings: PlanFiling[], today: string): PlanGap[] => {
  const gaps: PlanGap[] = [];
  for (const e of estates) {
    if (estateKind(e.estate_type) !== "bankruptcy" || !e.insolvency_date) continue;
    const have = new Set(filings.filter((f) => f.estate_id === e.id && f.form_number === "Form 65").map((f) => month(f.created_at)));
    const d = new Date(`${month(e.insolvency_date)}-01T00:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() + 1);
    while (month(d.toISOString()) < month(today)) {
      const m = month(d.toISOString());
      if (!have.has(m)) gaps.push({ estate: e, form: "Form 65", month: m });
      d.setUTCMonth(d.getUTCMonth() + 1);
    }
  }
  return gaps;
};
