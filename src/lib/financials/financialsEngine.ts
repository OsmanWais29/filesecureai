// Estate Financials engine — pure, deterministic. The UI only displays what this returns.
// Every figure abstains (returns null / a "blocked" item) when its inputs are missing.

export interface IncomePeriodLite {
  id: string;
  year: number | null;
  month: string | null;
  monthly_income: number;
  threshold_amount: number;
  surplus_amount: number;
  amount_required: number;
  payments_made: number;
  outstanding: number;
}
export interface ClientReportLite {
  id: string;
  period_month: string; // YYYY-MM-01
  status: string;
  review_state: string;
  linked_income_period_id: string | null;
  totals: Record<string, unknown> | null;
}
export interface ScheduleRowLite { due_date: string; amount_due: number; amount_received: number }

export const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const ymKey = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, "0")}`;
const periodKey = (p: IncomePeriodLite) => {
  const m = MONTHS.indexOf(p.month ?? "");
  return p.year && m >= 0 ? ymKey(p.year, m) : null;
};
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Months from the insolvency month up to (not including) the current month. */
export const expectedMonths = (insolvencyDate: string | null, today: Date): string[] => {
  if (!insolvencyDate) return [];
  const d = new Date(insolvencyDate + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return [];
  const out: string[] = [];
  let y = d.getUTCFullYear(), m = d.getUTCMonth();
  const endY = today.getUTCFullYear(), endM = today.getUTCMonth();
  while (y < endY || (y === endY && m < endM)) {
    out.push(ymKey(y, m));
    m++; if (m > 11) { m = 0; y++; }
  }
  return out;
};

export const addMonths = (iso: string, n: number) => {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
};

export type NeedAction = "add_date" | "request_report" | "import_report" | "review_surplus" | "chase_payment" | "seven_month_review";
export interface NeedItem { id: string; action: NeedAction; severity: "high" | "medium"; title: string; detail: string; month?: string; reportId?: string }

export interface NeedsInput {
  kind: "bankruptcy" | "proposal" | "other";
  insolvencyDate: string | null;
  periods: IncomePeriodLite[];
  reports: ClientReportLite[];
  schedule: ScheduleRowLite[];
  today: Date;
}

const fmt = (n: number) => `$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const label = (key: string) => { const [y, m] = key.split("-"); return `${MONTHS[Number(m) - 1]} ${y}`; };

export const needsYou = (i: NeedsInput): NeedItem[] => {
  const items: NeedItem[] = [];
  if (!i.insolvencyDate) {
    items.push({ id: "date", action: "add_date", severity: "high", title: "Add the date of insolvency", detail: "Monthly reports, surplus income and review dates can't be worked out without it." });
  }
  const have = new Set(i.periods.map(periodKey).filter(Boolean) as string[]);
  const submitted = new Map(i.reports.filter((r) => r.status === "submitted").map((r) => [r.period_month.slice(0, 7), r]));
  // Client reports waiting to be brought in
  for (const r of i.reports) {
    const key = r.period_month.slice(0, 7);
    if (r.status !== "draft" && !r.linked_income_period_id && !have.has(key)) {
      items.push({ id: `import-${r.id}`, action: "import_report", severity: "medium", title: `Client sent ${label(key)} income report`, detail: "Bring it in as this month's income record. Nothing is typed again.", month: key, reportId: r.id });
    }
  }
  if (i.kind === "bankruptcy") {
    for (const key of expectedMonths(i.insolvencyDate, i.today)) {
      const rep = i.reports.find((r) => r.period_month.slice(0, 7) === key && r.status !== "draft");
      if (!have.has(key) && !rep) {
        items.push({ id: `missing-${key}`, action: "request_report", severity: "high", title: `${label(key)} income report missing`, detail: "No report from the client and no income record.", month: key });
      }
    }
    // Surplus crossing
    const sorted = [...i.periods].filter((p) => periodKey(p)).sort((a, b) => (periodKey(a)! < periodKey(b)! ? -1 : 1));
    for (let k = 1; k < sorted.length; k++) {
      const prev = sorted[k - 1], cur = sorted[k];
      if ((prev.surplus_amount > 0) !== (cur.surplus_amount > 0)) {
        items.push({ id: `surplus-${cur.id}`, action: "review_surplus", severity: "high", title: `Surplus income ${cur.surplus_amount > 0 ? "started" : "stopped"} in ${label(periodKey(cur)!)}`, detail: `Was ${fmt(prev.surplus_amount)}, now ${fmt(cur.surplus_amount)}. Review the payment amount and notify the debtor.` });
      }
    }
    if (i.insolvencyDate) {
      const due = addMonths(i.insolvencyDate, 7);
      const days = (new Date(due + "T00:00:00Z").getTime() - i.today.getTime()) / 86400000;
      if (days <= 30) {
        items.push({ id: "seven-month", action: "seven_month_review", severity: days < 0 ? "high" : "medium", title: days < 0 ? "7-month review is past due" : "7-month review due soon", detail: `Review date ${due}. Surplus income and discharge path need a decision.` });
      }
    }
  }
  void submitted;
  // Missed payments
  const todayIso = i.today.toISOString().slice(0, 10);
  const missed = i.schedule.filter((r) => r.due_date < todayIso && r.amount_received + 0.005 < r.amount_due);
  if (missed.length) {
    const short = round2(missed.reduce((s, r) => s + (r.amount_due - r.amount_received), 0));
    items.push({ id: "missed", action: "chase_payment", severity: missed.length >= 3 ? "high" : "medium", title: `${missed.length} payment${missed.length > 1 ? "s" : ""} missed`, detail: `${fmt(short)} behind.${i.kind === "proposal" && missed.length >= 3 ? " Three or more missed payments: check the deemed-annulment rule." : ""}` });
  }
  return items.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "high" ? -1 : 1));
};

export interface PaymentPerformance { due: number; received: number; arrears: number; onTimeRate: number | null; scheduledEnd: string | null; projectedEnd: string | null }
export const paymentPerformance = (rows: ScheduleRowLite[], today: Date): PaymentPerformance | null => {
  if (!rows.length) return null;
  const t = today.toISOString().slice(0, 10);
  const past = rows.filter((r) => r.due_date < t);
  const due = round2(past.reduce((s, r) => s + r.amount_due, 0));
  const received = round2(rows.reduce((s, r) => s + r.amount_received, 0));
  const arrears = round2(Math.max(0, due - received));
  const onTime = past.filter((r) => r.amount_received + 0.005 >= r.amount_due).length;
  const sorted = [...rows].sort((a, b) => (a.due_date < b.due_date ? -1 : 1));
  const scheduledEnd = sorted[sorted.length - 1].due_date;
  const avg = rows.reduce((s, r) => s + r.amount_due, 0) / rows.length;
  const extra = arrears > 0 && avg > 0 ? Math.ceil(arrears / avg) : 0;
  return { due, received, arrears, onTimeRate: past.length ? onTime / past.length : null, scheduledEnd, projectedEnd: addMonths(scheduledEnd, extra) };
};

export interface TrendPoint { key: string; label: string; income: number | null; threshold: number | null; surplus: number | null; forecast?: number }
export const incomeTrend = (periods: IncomePeriodLite[]): TrendPoint[] => {
  const rows = periods.filter((p) => periodKey(p)).sort((a, b) => (periodKey(a)! < periodKey(b)! ? -1 : 1));
  const pts: TrendPoint[] = rows.map((p) => ({ key: periodKey(p)!, label: label(periodKey(p)!).slice(0, 3) + " " + String(p.year).slice(2), income: p.monthly_income, threshold: p.threshold_amount, surplus: p.surplus_amount }));
  if (rows.length >= 3) {
    const last3 = rows.slice(-3);
    const avg = round2(last3.reduce((s, p) => s + p.monthly_income, 0) / 3);
    let [y, m] = pts[pts.length - 1].key.split("-").map(Number); m -= 1;
    pts[pts.length - 1].forecast = pts[pts.length - 1].income ?? undefined;
    for (let k = 0; k < 3; k++) {
      m++; if (m > 11) { m = 0; y++; }
      const key = ymKey(y, m);
      pts.push({ key, label: label(key).slice(0, 3) + " " + String(y).slice(2), income: null, threshold: null, surplus: null, forecast: avg });
    }
  }
  return pts;
};

/** Estimated cents-on-the-dollar for unsecured creditors. Abstains with no admitted claims. */
export const estimatedPayout = (trustBalance: number, futureReceipts: number, admittedClaims: number, levyRate = 0.05) => {
  if (admittedClaims <= 0) return null;
  const pool = Math.max(0, (trustBalance + futureReceipts) * (1 - levyRate));
  return { pool: round2(pool), ratio: Math.min(1, pool / admittedClaims) };
};

/** Records brought in from client reports versus typed. Minutes saved is an estimate, labelled as one. */
export const automationStats = (periods: IncomePeriodLite[], reports: ClientReportLite[], minutesPerRecord = 15) => {
  const linked = new Set(reports.map((r) => r.linked_income_period_id).filter(Boolean));
  const auto = periods.filter((p) => linked.has(p.id)).length;
  return { auto, typed: periods.length - auto, estimatedHoursSaved: round2((auto * minutesPerRecord) / 60) };
};
