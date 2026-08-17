import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CalendarClock, Info, XCircle } from "lucide-react";
import {
  EstateSummary,
  creditorPosition,
  estateWork,
  signals,
  trustPosition,
} from "@/data/estateWorkspace";

const StatList = ({ items }: { items: { label: string; value: string; emphasis?: boolean }[] }) => (
  <dl className="space-y-2">
    {items.map((i) => (
      <div key={i.label} className="flex items-center justify-between text-sm">
        <dt className="text-muted-foreground">{i.label}</dt>
        <dd className={i.emphasis ? "font-semibold" : ""}>{i.value}</dd>
      </div>
    ))}
  </dl>
);

export const OverviewTab = ({ estate }: { estate: EstateSummary }) => (
  <div className="grid gap-4 lg:grid-cols-2">
    <Card className="lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Estate Health</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Stage</p>
          <p className="mt-1 text-lg font-medium">{estate.stage}</p>
          <Progress value={estate.stageProgress} className="mt-3 h-2" />
          <p className="mt-1 text-sm text-muted-foreground">{estate.stageProgress}% complete</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Next Critical Date</p>
          <p className="mt-1 flex items-center gap-2 text-lg font-medium">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            {estate.nextDeadline}
          </p>
        </div>
      </CardContent>
    </Card>

    <Card className="lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Signals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {signals.map((s) => (
          <div key={s.id} className="flex items-start gap-3 rounded-md border p-3">
            {s.level === "insight" && <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />}
            {s.level === "warning" && <AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" />}
            {(s.level === "exception" || s.level === "critical") && (
              <XCircle className="mt-0.5 h-4 w-4 text-destructive" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{s.title}</span>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {s.level}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{s.detail}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.source}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Trust Position</CardTitle>
      </CardHeader>
      <CardContent>
        <StatList items={trustPosition} />
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Creditors</CardTitle>
      </CardHeader>
      <CardContent>
        <StatList items={creditorPosition} />
      </CardContent>
    </Card>

    <Card className="lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Estate Work</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {estateWork.map((w) => (
          <div key={w.label} className="rounded-md border p-3">
            <div className="text-2xl font-semibold">{w.value}</div>
            <div className="text-xs text-muted-foreground">{w.label}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);
