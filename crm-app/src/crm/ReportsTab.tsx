// Reports: lead flow, conversion, sources, file mix and debt under administration.
import { ReactElement } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Download, Filter, Landmark, Percent, PieChart, TrendingUp, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FILE_TYPES, LEADS_BY_MONTH, STAGES, daysAgo, money, pretty } from "./data";
import { useCRM } from "./store";
import { SectionTitle, StatCard } from "./ui";

// Chart colours come from theme tokens (see index.css)
const C1 = "hsl(var(--chart-1))";
const C2 = "hsl(var(--chart-2))";
const AXIS = { tickLine: false, axisLine: false, fontSize: 12, stroke: "hsl(var(--muted-foreground))" };
const TIP = { contentStyle: { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 } };

const FILED = ["Filed", "In administration", "Discharged"]; // stages that count as converted

export const ReportsTab = () => {
  const { clients } = useCRM();

  // Headline numbers
  const newLeads = clients.filter((c) => daysAgo(c.createdAt) <= 30).length;
  const converted = clients.filter((c) => FILED.includes(c.stage));
  const conversion = clients.length ? Math.round((converted.length / clients.length) * 100) : 0;
  const underAdmin = clients.filter((c) => ["Filed", "In administration"].includes(c.stage)).reduce((s, c) => s + c.totalDebt, 0);
  const avgDebt = converted.length ? converted.reduce((s, c) => s + c.totalDebt, 0) / converted.length : 0;

  // Per lead source: how many came in and how many filed
  const bySource = [...new Set(clients.map((c) => c.leadSource))].map((src) => ({
    source: pretty(src),
    leads: clients.filter((c) => c.leadSource === src).length,
    filed: clients.filter((c) => c.leadSource === src && FILED.includes(c.stage)).length,
  })).sort((a, b) => b.leads - a.leads);

  // Files per type and per stage
  const byType = FILE_TYPES.map((t) => ({ type: t, files: clients.filter((c) => c.fileType === t).length }));
  const funnel = STAGES.map((s) => ({ stage: s, files: clients.filter((c) => c.stage === s).length }));

  // Download the client list as a CSV file
  const exportCsv = () => {
    const head = ["Name", "Email", "Phone", "Stage", "File type", "Total debt", "Lead source", "Trustee", "Created"];
    const rows = clients.map((c) => [c.name, c.email, c.phone, c.stage, c.fileType, c.totalDebt, pretty(c.leadSource), c.assignedTo, c.createdAt.slice(0, 10)]);
    const csv = [head, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: "crm-clients.csv" });
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export clients (CSV)</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={UserPlus} label="New leads" hint="last 30 days" value={newLeads} />
        <StatCard icon={Percent} label="Lead → filing conversion" hint="all time" value={`${conversion}%`} />
        <StatCard icon={Landmark} label="Debt under administration" hint="filed + active estates" value={money(underAdmin)} />
        <StatCard icon={TrendingUp} label="Average debt per filing" value={money(avgDebt)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads vs filings per month */}
        <ChartCard icon={BarChart3} title="Leads and filings by month">
          <BarChart data={LEADS_BY_MONTH}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" {...AXIS} />
            <YAxis {...AXIS} width={30} />
            <Tooltip {...TIP} cursor={{ fill: "hsl(var(--muted))" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="leads" name="Leads" fill={C1} radius={[4, 4, 0, 0]} />
            <Bar dataKey="filed" name="Filed" fill={C2} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        {/* Lead sources */}
        <ChartCard icon={Filter} title="Lead sources and how many filed">
          <BarChart data={bySource} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
            <XAxis type="number" allowDecimals={false} {...AXIS} />
            <YAxis type="category" dataKey="source" {...AXIS} width={100} />
            <Tooltip {...TIP} cursor={{ fill: "hsl(var(--muted))" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="leads" name="Leads" fill={C1} radius={[0, 4, 4, 0]} />
            <Bar dataKey="filed" name="Filed" fill={C2} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>

        {/* Pipeline funnel */}
        <ChartCard icon={Filter} title="Files by stage">
          <BarChart data={funnel} layout="vertical" margin={{ left: 40 }}>
            <XAxis type="number" allowDecimals={false} {...AXIS} />
            <YAxis type="category" dataKey="stage" {...AXIS} width={130} />
            <Tooltip {...TIP} cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="files" name="Files" fill={C1} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>

        {/* File mix */}
        <ChartCard icon={PieChart} title="Files by type">
          <BarChart data={byType}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="type" {...AXIS} interval={0} fontSize={11} />
            <YAxis allowDecimals={false} {...AXIS} width={30} />
            <Tooltip {...TIP} cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="files" name="Files" fill={C2} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
};

// Card wrapper with a fixed-height responsive chart
const ChartCard = ({ icon, title, children }: { icon: typeof BarChart3; title: string; children: ReactElement }) => (
  <Card className="p-5">
    <SectionTitle icon={icon}>{title}</SectionTitle>
    <ResponsiveContainer width="100%" height={260}>{children}</ResponsiveContainer>
  </Card>
);
