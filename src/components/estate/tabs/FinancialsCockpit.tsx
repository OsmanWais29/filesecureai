import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CheckCircle2, Clock, FileInput, Loader2, Send, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { MetricStrip, PageHeading } from "@/components/estate/PageHeading";
import { useEstateRow } from "@/hooks/useEstateRecords";
import { useEstateIncomePeriods } from "@/hooks/useEstateIncome";
import { useScheduleRows } from "@/hooks/useEstateSchedules";
import { useTrustPosition } from "@/hooks/useEstateAccounting";
import { useEstateCreditors } from "@/hooks/useEstateCreditors";
import { useClientDocsToReview, useClientIncomeReports, useImportClientReport } from "@/hooks/useFinancialsWorkbench";
import { ReadIncomeDocs } from "@/components/estate/tabs/ReadIncomeDocs";
import { useCreateStaffRequest } from "@/data/clientPortal/staff";
import { MONTHS, automationStats, estimatedPayout, incomeTrend, needsYou, paymentPerformance, type NeedItem } from "@/lib/financials/financialsEngine";

const money = (n: number) => `$${Number(n || 0).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (n: number) => `${Math.round(n * 100)}%`;

export const FinancialsCockpit = ({ estateId, title, description }: { estateId?: string; title: string; description?: string }) => {
  const [, setParams] = useSearchParams();
  const go = (m: string, p: string) => setParams((prev) => { const n = new URLSearchParams(prev); n.set("m", m); n.set("p", p); return n; });
  const today = useMemo(() => new Date(), []);

  const { data: estate } = useEstateRow(estateId);
  const { data: periods = [], isLoading } = useEstateIncomePeriods(estateId);
  const { data: reports = [] } = useClientIncomeReports(estateId);
  const { data: docsToReview = 0 } = useClientDocsToReview(estateId);
  const { data: schedule = [] } = useScheduleRows(estateId);
  const trust = useTrustPosition(estateId);
  const { data: creditors = [] } = useEstateCreditors(estateId);
  const importReport = useImportClientReport(estateId);
  const createRequest = useCreateStaffRequest();
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  const type = String((estate as any)?.estate_type ?? "").toLowerCase();
  const kind = type.includes("proposal") ? "proposal" : type.includes("bankrupt") ? "bankruptcy" : "other";
  const insolvencyDate = ((estate as any)?.insolvency_date as string | null) ?? null;

  const items = needsYou({ kind, insolvencyDate, periods, reports, schedule, today }).filter((i) => !done.has(i.id));
  const perf = paymentPerformance(schedule, today);
  const trend = incomeTrend(periods);
  const admitted = creditors.reduce((s, c: any) => s + Number(c.admitted_dividend || 0), 0);
  const futureReceipts = schedule.filter((r) => r.due_date >= today.toISOString().slice(0, 10)).reduce((s, r) => s + Math.max(0, r.amount_due - r.amount_received), 0);
  const payout = estimatedPayout(trust.balance, futureReceipts, admitted);
  const auto = automationStats(periods, reports);
  const ord = (p: { year: number | null; month: string | null }) => (p.year ?? 0) * 100 + MONTHS.indexOf(p.month ?? "");
  const latest = periods.length ? [...periods].sort((a, b) => ord(a) - ord(b)).at(-1) : undefined;
  const surplusOutstanding = periods.reduce((s, p) => s + Number(p.outstanding || 0), 0);

  const act = async (item: NeedItem) => {
    setBusy(item.id);
    try {
      if (item.action === "add_date") return go("record", "details");
      if (item.action === "review_surplus" || item.action === "seven_month_review") return go("financials", "income");
      if (item.action === "import_report") {
        const r = reports.find((x) => x.id === item.reportId);
        if (r) await importReport.mutateAsync(r as any);
        toast({ title: "Income record added", description: "Brought in from the client's report. Surplus was recalculated." });
      } else if (item.action === "request_report" || item.action === "chase_payment") {
        if (!estateId) return;
        await createRequest.mutateAsync({
          estateId,
          title: item.action === "request_report" ? item.title.replace(" missing", "") : "Missed payment",
          description: item.action === "request_report" ? "Please complete your monthly income and expense report and upload your pay stubs for this month." : `Our records show a missed payment. ${item.detail} Please make the payment or contact us.`,
          requestType: item.action === "request_report" ? "complete_income_statement" : "provide_payment_information",
          priority: item.severity === "high" ? "Time sensitive" : "Important",
          staffName: "Trustee office",
          sourceSignalId: `financials:${item.id}`,
        });
        toast({ title: "Request sent to the client", description: "It now shows in their portal." });
      }
      setDone((s) => new Set(s).add(item.id));
    } catch (e) {
      toast({ title: "That didn't go through", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const buttonFor = (i: NeedItem) => ({
    add_date: "Add date", request_report: "Request from client", import_report: "Bring it in",
    review_surplus: "Recalculate", chase_payment: "Send notice", seven_month_review: "Open review",
  })[i.action];

  return (
    <>
      <PageHeading title={title} description={description} />
      <MetricStrip
        items={[
          { label: "Trust balance", value: money(trust.balance) },
          { label: "Latest monthly income", value: latest ? money(latest.monthly_income) : "No record yet" },
          { label: "Surplus owing", value: money(surplusOutstanding), tone: surplusOutstanding > 0 ? "warn" : "default" },
          { label: "Payments behind", value: perf ? money(perf.arrears) : "No schedule", tone: perf && perf.arrears > 0 ? "bad" : "default" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Needs you</CardTitle>
            <Badge variant={items.length ? "destructive" : "secondary"}>{items.length} open</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Checking this estate…</div>}
            {!isLoading && items.length === 0 && (
              <div className="flex items-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Nothing needs you in Financials right now.
              </div>
            )}
            {docsToReview > 0 && (
              <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div className="flex items-start gap-3">
                  <FileInput className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div><div className="text-sm font-medium">{docsToReview} client document{docsToReview > 1 ? "s" : ""} waiting for review</div>
                  <div className="text-xs text-muted-foreground">Pay stubs, statements or notices the client uploaded.</div></div>
                </div>
                <Button size="sm" variant="outline" onClick={() => go("documents", "all")}>Review</Button>
              </div>
            )}
            <ReadIncomeDocs estateId={estateId} />
            {items.map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div className="flex items-start gap-3">
                  {i.severity === "high" ? <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" /> : <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />}
                  <div><div className="text-sm font-medium">{i.title}</div><div className="text-xs text-muted-foreground">{i.detail}</div></div>
                </div>
                <Button size="sm" variant={i.severity === "high" ? "default" : "outline"} disabled={busy === i.id} onClick={() => act(i)}>
                  {busy === i.id ? <Loader2 className="h-4 w-4 animate-spin" /> : i.action === "request_report" || i.action === "chase_payment" ? <Send className="mr-1 h-3.5 w-3.5" /> : null}
                  {buttonFor(i)}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4" /> Filled in for you</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">From client reports</span><span className="font-medium">{auto.auto}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Typed by staff</span><span className="font-medium">{auto.typed}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Time saved (estimate)</span><span className="font-medium">{auto.estimatedHoursSaved} h</span></div>
            <p className="text-xs text-muted-foreground">Estimate assumes 15 minutes to type one monthly record. Reading amounts straight off uploaded pay stubs isn't switched on yet.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">Income against the surplus limit</CardTitle></CardHeader>
          <CardContent>
            {trend.length < 2 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Needs at least two monthly income records to draw a trend.</p>
            ) : (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="label" fontSize={11} />
                      <YAxis fontSize={11} tickFormatter={(v) => `$${Math.round(v / 100) / 10}k`} />
                      <Tooltip formatter={(v: number) => money(v)} />
                      <Area type="monotone" dataKey="income" name="Monthly income" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" />
                      <Line type="stepAfter" dataKey="threshold" name="Surplus limit" stroke="hsl(var(--destructive))" dot={false} />
                      <Line type="monotone" dataKey="forecast" name="Forecast (average of last 3)" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 4" dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Dashed line is a forecast, not a reported figure. Surplus limits come from the Superintendent's standard for the year saved on each record; confirm the current year's figures before relying on them.</p>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Payments</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {!perf ? <p className="text-muted-foreground">No payment schedule set up.</p> : (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">Paid / due so far</span><span>{money(perf.received)} / {money(perf.due)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">On time</span><span>{perf.onTimeRate == null ? "—" : pct(perf.onTimeRate)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Scheduled finish</span><span>{perf.scheduledEnd}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Projected finish</span><span className={perf.projectedEnd !== perf.scheduledEnd ? "text-destructive" : ""}>{perf.projectedEnd}</span></div>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Estimated payout to creditors</CardTitle></CardHeader>
            <CardContent className="text-sm">
              {!payout ? <p className="text-muted-foreground">Can't estimate: no claims admitted yet.</p> : (
                <>
                  <div className="text-2xl font-semibold">{Math.round(payout.ratio * 100)}¢ <span className="text-sm font-normal text-muted-foreground">per dollar</span></div>
                  <p className="mt-1 text-xs text-muted-foreground">{money(payout.pool)} expected after a 5% levy, from trust balance plus scheduled payments, against {money(admitted)} admitted. Fees and costs aren't deducted yet.</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
