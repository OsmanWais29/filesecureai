import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Scale, Sparkles } from "lucide-react";
import { PostureMetric, formatRatio, ratioDetail } from "@/data/analytics/postureData";
import { STATUS_STYLES } from "./statusStyles";

interface Props {
  metric: PostureMetric | null;
  asOf: string;
  onOpenChange: (open: boolean) => void;
}

const exportCsv = (metric: PostureMetric, asOf: string) => {
  const rows = [
    ["Metric", metric.label],
    ["As of", asOf],
    ["Obligation", metric.citation ?? "Operational measure — no obligation cited"],
    ["Numerator", String(metric.numerator)],
    ["Denominator", String(metric.denominator)],
    ["Value", formatRatio(metric)],
    ["Status", metric.status],
    ["Basis", metric.statusReason],
    [],
    ["Estate", "File number", "LIT", "Office", "Finding", "Status"],
    ...metric.files.map((r) => [r.estate, r.file, r.lit, r.office, r.detail, r.status]),
  ];
  const csv = rows
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${metric.id}-as-of-${asOf}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const MetricDrilldown: React.FC<Props> = ({ metric, asOf, onOpenChange }) => {
  const [showAllNote, setShowAllNote] = useState(false);
  if (!metric) return null;
  const style = STATUS_STYLES[metric.status];
  const total = metric.totalFiles ?? metric.files.length;
  const truncated = total > metric.files.length;

  return (
    <Sheet open={!!metric} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-start gap-2">
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
            {metric.label}
          </SheetTitle>
          <SheetDescription>
            {metric.drilldownHeader ?? (
              <>
                As of {asOf} · {ratioDetail(metric) || `${metric.numerator} / ${metric.denominator}`} ·{" "}
                <span className="font-medium">{formatRatio(metric)}</span>
              </>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          {metric.citation && (
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <Scale className="h-4 w-4" /> Obligation
              </div>
              <p className="mt-1 text-muted-foreground">{metric.citation}</p>
            </div>
          )}

          <div>
            <Badge variant="outline" className={style.chip}>
              {style.label}
            </Badge>
            <p className="mt-2 text-sm text-muted-foreground">{metric.statusReason}</p>
            {metric.note && (
              <p className="mt-1 text-sm text-muted-foreground">{metric.note}</p>
            )}
          </div>

          {metric.aiDerived && (
            <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">
              <div className="flex items-center gap-2 font-medium text-warning">
                <Sparkles className="h-4 w-4" /> AI-derived figure
              </div>
              <p className="mt-1 text-muted-foreground">
                Human sign-off:{" "}
                {metric.signOff === "signed"
                  ? "recorded"
                  : metric.signOff === "pending"
                  ? "pending — do not act on this figure until a reviewer signs it"
                  : "not required"}
              </p>
            </div>
          )}

          {metric.spread && (
            <div>
              <Separator className="mb-3" />
              <h4 className="text-sm font-semibold mb-2">
                {metric.spreadLabel ?? "Breakdown"}
              </h4>
              <div className="space-y-2">
                {metric.spread.map((s) => {
                  const pct = s.denominator ? (s.numerator / s.denominator) * 100 : 0;
                  return (
                    <div key={s.label} className="text-sm">
                      <div className="flex justify-between">
                        <span>{s.label}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {s.numerator}/{s.denominator} · {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded bg-muted">
                        <div
                          className="h-1.5 rounded bg-primary"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <Separator className="mb-3" />
            <div className="mb-2 flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold">
                Files behind the number ({total})
                {truncated && ` · showing ${metric.files.length}`}
              </h4>
              {truncated && (
                <button
                  type="button"
                  onClick={() => setShowAllNote(true)}
                  className="text-xs text-primary underline underline-offset-2"
                >
                  Show all {total}
                </button>
              )}
            </div>
            {truncated && showAllNote && (
              <p className="mb-2 text-xs text-muted-foreground">
                The full list of {total} files opens in the SRD queue for this snapshot.
              </p>
            )}
            <div className="rounded-md border divide-y">
              {metric.files.map((r) => {
                const rowStyle = STATUS_STYLES[r.status];
                const showDot = metric.fileDotsBreachOnly ? r.status === "breach" : true;
                return (
                  <div key={r.file} className="p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{r.estate}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {r.file}
                      </span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{r.detail}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      {showDot && <span className={`h-2 w-2 rounded-full ${rowStyle.dot}`} />}
                      {r.lit} · {r.office}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => exportCsv(metric, asOf)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export this metric as of {asOf}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
