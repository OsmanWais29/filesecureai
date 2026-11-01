import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Lock, Scale, Building2, BarChart3 } from "lucide-react";
import {
  SECTION_A,
  SECTION_B,
  SNAPSHOTS,
  PostureMetric,
  formatRatio,
} from "@/data/analytics/postureData";
import { PostureMetricCard } from "./PostureMetricCard";
import { MetricDrilldown } from "./MetricDrilldown";
import { BenchmarkTable } from "./BenchmarkTable";
import { STATUS_STYLES } from "./statusStyles";

const exportSection = (
  title: string,
  metrics: PostureMetric[],
  asOf: string
) => {
  const rows = [
    [`${title} — audit-readiness report`],
    ["As of", asOf],
    ["Generated", new Date().toISOString()],
    [],
    ["Metric", "Obligation", "Numerator", "Denominator", "Value", "Status", "Basis", "AI-derived", "Human sign-off"],
    ...metrics.map((m) => [
      m.label,
      m.citation ?? "",
      String(m.numerator),
      String(m.denominator),
      formatRatio(m),
      m.status,
      m.statusReason,
      m.aiDerived ? "yes" : "no",
      m.aiDerived ? m.signOff ?? "" : "n/a",
    ]),
  ];
  const csv = rows
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-as-of-${asOf}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const PostureAnalytics: React.FC = () => {
  const [snapshotId, setSnapshotId] = useState(SNAPSHOTS[0].id);
  const [selected, setSelected] = useState<PostureMetric | null>(null);

  const snapshot = useMemo(
    () => SNAPSHOTS.find((s) => s.id === snapshotId) ?? SNAPSHOTS[0],
    [snapshotId]
  );

  const breaches = SECTION_A.filter((m) => m.status === "breach");
  const watches = SECTION_A.filter((m) => m.status === "watch");

  return (
    <div className="space-y-6">
      {/* Snapshot control — absolute dates only, sealed and reproducible */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Immutable snapshot</p>
              <p className="text-xs text-muted-foreground">
                Sealed {new Date(snapshot.sealedAt).toISOString().slice(0, 16).replace("T", " ")} UTC
                by {snapshot.sealedBy}. Reproducible on any later date.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={snapshotId} onValueChange={setSnapshotId}>
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SNAPSHOTS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="regulatory" className="space-y-5">
        <TabsList className="h-auto p-1">
          <TabsTrigger value="regulatory" className="gap-2 px-4 py-2">
            <Scale className="h-4 w-4" /> A · Regulatory posture
            {breaches.length > 0 && (
              <Badge variant="outline" className={STATUS_STYLES.breach.chip}>
                {breaches.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="firm" className="gap-2 px-4 py-2">
            <Building2 className="h-4 w-4" /> B · Firm performance
          </TabsTrigger>
          <TabsTrigger value="benchmarks" className="gap-2 px-4 py-2">
            <BarChart3 className="h-4 w-4" /> C · Benchmarks
          </TabsTrigger>
        </TabsList>

        {/* SECTION A */}
        <TabsContent value="regulatory" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-base">
                    What the OSB's models score — as of {snapshot.asOf}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Every metric is tied to a named obligation, is point-in-time, and drills
                    down to the files behind the number. Red means a breached obligation, not
                    "below target".
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => exportSection("Regulatory posture", SECTION_A, snapshot.asOf)}
                >
                  <Download className="mr-2 h-4 w-4" /> Audit-readiness report
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline" className={STATUS_STYLES.breach.chip}>
                  {breaches.length} breached obligations
                </Badge>
                <Badge variant="outline" className={STATUS_STYLES.watch.chip}>
                  {watches.length} exposures
                </Badge>
                <Badge variant="outline" className={STATUS_STYLES.neutral.chip}>
                  412 open files in scope
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {SECTION_A.map((m) => (
                  <PostureMetricCard
                    key={m.id}
                    metric={m}
                    asOf={snapshot.asOf}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION B */}
        <TabsContent value="firm" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-base">
                    Capacity, conversion and economics — as of {snapshot.asOf}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Same discipline as Section A — absolute timestamps, visible numerators,
                    drill-down — with the managing partner as the audience.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => exportSection("Firm performance", SECTION_B, snapshot.asOf)}
                >
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {SECTION_B.map((m) => (
                  <PostureMetricCard
                    key={m.id}
                    metric={m}
                    asOf={snapshot.asOf}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION C */}
        <TabsContent value="benchmarks">
          <BenchmarkTable />
        </TabsContent>
      </Tabs>

      <MetricDrilldown
        metric={selected}
        asOf={snapshot.asOf}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
};
