// Reports: lead flow, conversion, sources, file mix and debt under administration.
// Numbers are computed in SQL by the backend (/reports/summary). Lazy-loaded, so the charts library only downloads when this tab is opened.
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Download, Filter, Landmark, Percent, PieChart, TrendingUp, UserPlus, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "./api";
import { FILE_TYPES, STAGES, money, pretty } from "./data";
import { useCRM } from "./store";
import { Panel, StatCard } from "./ui";

// Chart styling from theme tokens (see index.css)
const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))"];
const AXIS = { tickLine: false, axisLine: false, fontSize: 12, stroke: "hsl(var(--muted-foreground))" };

// One bar chart: `x` is the category key, `bars` are [dataKey, label] pairs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Chart = ({ icon, title, data, x, bars, vertical }: { icon: LucideIcon; title: string; data: any[]; x: string; bars: [string, string][]; vertical?: boolean }) => (
  <Panel icon={icon} title={title}>
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout={vertical ? "vertical" : "horizontal"} margin={{ left: vertical ? 30 : 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={vertical} horizontal={!vertical} stroke="hsl(var(--border))" />
        {vertical
          ? <><XAxis type="number" allowDecimals={false} {...AXIS} /><YAxis type="category" dataKey={x} width={120} {...AXIS} /></>
          : <><XAxis dataKey={x} interval={0} {...AXIS} fontSize={11} /><YAxis allowDecimals={false} width={30} {...AXIS} /></>}
        <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
        {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {bars.map(([key, name], i) => <Bar key={key} dataKey={key} name={name} fill={COLORS[i]} radius={vertical ? [0, 4, 4, 0] : [4, 4, 0, 0]} />)}
      </BarChart>
    </ResponsiveContainer>
  </Panel>
);

type Group = { key: string; leads: number; filed: number };
type Summary = {
  newLeads: number; conversionRate: number; debtUnderAdmin: number; avgDebtPerFiling: number;
  byMonth: { month: string; leads: number; filed: number }[];
  bySource: Group[]; byStage: Group[]; byFileType: Group[];
};

// Fill in every known category (0 when the server has none), in a fixed order
const fill = (keys: readonly string[], rows: Group[] = []) =>
  keys.map((k) => ({ key: k, files: rows.find((r) => r.key === k)?.leads ?? 0 }));

export const ReportsTab = () => {
  const { clients } = useCRM();
  const [r, setR] = useState<Summary | null>(null);
  useEffect(() => void api.reports().then((x) => setR(x as Summary)).catch(() => setR(null)), [clients]);

  const bySource = (r?.bySource ?? []).map((g) => ({ ...g, source: pretty(g.key) })).sort((a, b) => b.leads - a.leads);
  const byMonth = (r?.byMonth ?? []).map((m) => ({ ...m, month: format(new Date(`${m.month}-01T12:00`), "MMM") }));

  // Download the client list as CSV
  const exportCsv = () => {
    const rows = [["Name", "Email", "Phone", "Stage", "File type", "Total debt", "Lead source", "Trustee", "Created"],
      ...clients.map((c) => [c.name, c.email, c.phone, c.stage, c.fileType, c.totalDebt, pretty(c.leadSource), c.assignedTo, c.createdAt.slice(0, 10)])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: "crm-clients.csv" }).click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end"><Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export clients (CSV)</Button></div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={UserPlus} label="New leads" hint="last 30 days" value={r?.newLeads ?? "–"} />
        <StatCard icon={Percent} label="Lead → filing conversion" hint="all time" value={r ? `${Math.round(r.conversionRate * 100)}%` : "–"} />
        <StatCard icon={Landmark} label="Debt under administration" hint="filed + active estates" value={r ? money(r.debtUnderAdmin) : "–"} />
        <StatCard icon={TrendingUp} label="Average debt per filing" value={r ? money(r.avgDebtPerFiling) : "–"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Chart icon={BarChart3} title="Leads and filings by month" data={byMonth} x="month" bars={[["leads", "Leads"], ["filed", "Filed"]]} />
        <Chart icon={Filter} title="Lead sources and how many filed" data={bySource} x="source" bars={[["leads", "Leads"], ["filed", "Filed"]]} vertical />
        <Chart icon={Filter} title="Files by stage" data={fill(STAGES, r?.byStage)} x="key" bars={[["files", "Files"]]} vertical />
        <Chart icon={PieChart} title="Files by type" data={fill(FILE_TYPES, r?.byFileType)} x="key" bars={[["files", "Files"]]} />
      </div>
    </div>
  );
};
