// Reports: lead flow, conversion, sources, file mix and debt under administration.
// Lazy-loaded, so the charts library only downloads when this tab is opened.
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Download, Filter, Landmark, Percent, PieChart, TrendingUp, UserPlus, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FILE_TYPES, LEADS_BY_MONTH, STAGES, daysAgo, isActive, isConverted, money, pretty, sumDebt } from "./data";
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

export const ReportsTab = () => {
  const { clients } = useCRM();
  const converted = clients.filter(isConverted);
  const count = (pred: (c: (typeof clients)[number]) => boolean) => clients.filter(pred).length;

  const bySource = [...new Set(clients.map((c) => c.leadSource))]
    .map((s) => ({ source: pretty(s), leads: count((c) => c.leadSource === s), filed: count((c) => c.leadSource === s && isConverted(c)) }))
    .sort((a, b) => b.leads - a.leads);

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
        <StatCard icon={UserPlus} label="New leads" hint="last 30 days" value={count((c) => daysAgo(c.createdAt) <= 30)} />
        <StatCard icon={Percent} label="Lead → filing conversion" hint="all time" value={`${Math.round((converted.length / (clients.length || 1)) * 100)}%`} />
        <StatCard icon={Landmark} label="Debt under administration" hint="filed + active estates" value={money(sumDebt(clients.filter(isActive)))} />
        <StatCard icon={TrendingUp} label="Average debt per filing" value={money(sumDebt(converted) / (converted.length || 1))} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Chart icon={BarChart3} title="Leads and filings by month" data={LEADS_BY_MONTH} x="month" bars={[["leads", "Leads"], ["filed", "Filed"]]} />
        <Chart icon={Filter} title="Lead sources and how many filed" data={bySource} x="source" bars={[["leads", "Leads"], ["filed", "Filed"]]} vertical />
        <Chart icon={Filter} title="Files by stage" data={STAGES.map((s) => ({ stage: s, files: count((c) => c.stage === s) }))} x="stage" bars={[["files", "Files"]]} vertical />
        <Chart icon={PieChart} title="Files by type" data={FILE_TYPES.map((t) => ({ type: t, files: count((c) => c.fileType === t) }))} x="type" bars={[["files", "Files"]]} />
      </div>
    </div>
  );
};
