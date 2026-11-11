import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { automationStats, paymentPerformance, type ClientReportLite, type IncomePeriodLite, type ScheduleRowLite } from "@/lib/financials/financialsEngine";

const db = supabase as unknown as { from: (t: string) => any };
const money = (n: number) => `$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const byEstate = <T extends { estate_id: string }>(rows: T[]) => rows.reduce<Record<string, T[]>>((m, r) => ((m[r.estate_id] ??= []).push(r), m), {});

/** Live, firm-wide roll-up of the same estate Financials figures (only estates you can see). */
export const FirmFinancials = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["firm-financials"],
    queryFn: async () => {
      const [p, s, r, d] = await Promise.all([
        db.from("estate_income_periods").select("id,estate_id,year,month,monthly_income,threshold_amount,surplus_amount,amount_required,outstanding,income_basis"),
        db.from("estate_schedule_rows").select("estate_id,due_date,amount_due,amount_received"),
        db.from("client_portal_income_submissions").select("id,estate_id,period_month,status,review_state,linked_income_period_id,totals"),
        db.from("client_portal_documents").select("id", { count: "exact", head: true }).in("review_state", ["Received", "Not started", "Pending", "pending"]),
      ]);
      const err = p.error || s.error || r.error || d.error;
      if (err) throw err;
      return { periods: p.data ?? [], schedule: s.data ?? [], reports: r.data ?? [], docs: d.count ?? 0 };
    },
  });

  if (isLoading) return <Card><CardContent className="flex items-center gap-2 p-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading estate financials…</CardContent></Card>;
  if (error || !data) return <Card><CardContent className="p-4 text-sm text-muted-foreground">Estate financials could not be loaded.</CardContent></Card>;

  const today = new Date();
  const perf = Object.values(byEstate(data.schedule as (ScheduleRowLite & { estate_id: string })[]))
    .map((rows) => paymentPerformance(rows.map((x) => ({ ...x, amount_due: Number(x.amount_due) || 0, amount_received: Number(x.amount_received) || 0 })), today))
    .filter(Boolean) as NonNullable<ReturnType<typeof paymentPerformance>>[];
  const arrears = perf.reduce((t, x) => t + x.arrears, 0);
  const behind = perf.filter((x) => x.arrears > 0).length;
  const rates = perf.map((x) => x.onTimeRate).filter((x): x is number => x != null);
  const onTime = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : null;
  const owing = (data.periods as any[]).reduce((t, x) => t + (Number(x.outstanding) || 0), 0);
  const surplusEstates = new Set((data.periods as any[]).filter((x) => Number(x.surplus_amount) > 0).map((x) => x.estate_id)).size;
  const waiting = (data.reports as ClientReportLite[]).filter((x) => x.status === "submitted" && !x.linked_income_period_id).length;
  const auto = automationStats(data.periods as IncomePeriodLite[], data.reports as ClientReportLite[]);

  const tiles: [string, string, string][] = [
    ["Payment arrears", perf.length ? money(arrears) : "No schedules", perf.length ? `${behind} of ${perf.length} estates behind` : "No payment schedules recorded"],
    ["On-time payments", onTime == null ? "Not enough data" : `${Math.round(onTime * 100)}%`, `Average across ${rates.length} estates with past-due payments`],
    ["Surplus income owing", money(owing), `${surplusEstates} estates above the surplus limit`],
    ["Waiting on staff", `${waiting + data.docs}`, `${waiting} client reports to import · ${data.docs} documents to review`],
    ["Records from clients", `${auto.auto} of ${auto.auto + auto.typed}`, `About ${auto.estimatedHoursSaved} staff hours saved (estimate, 15 min per record)`],
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Estate financials — live across your estates</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">Same figures as each estate's Financials page, added up. Surplus amounts use the OSB 2024–2026 limits.</p>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map(([t, v, h]) => (
          <div key={t} className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">{t}</div>
            <div className="mt-1 text-lg font-semibold">{v}</div>
            <div className="mt-1 text-xs text-muted-foreground">{h}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
