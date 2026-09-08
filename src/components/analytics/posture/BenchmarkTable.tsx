import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SECTION_C, BenchmarkBadge } from "@/data/analytics/postureData";
import { STATUS_STYLES } from "./statusStyles";

const BADGE: Record<BenchmarkBadge, { label: string; className: string }> = {
  above: {
    label: "Above national",
    className: "bg-primary/10 text-primary border-primary/30",
  },
  below: {
    label: "Below national",
    className: "bg-primary/10 text-primary border-primary/30",
  },
  inline: {
    label: "In line with national",
    className: "bg-muted text-muted-foreground border-border",
  },
  context: {
    label: "Context",
    className: "bg-muted text-muted-foreground border-border",
  },
  none: {
    label: "No published threshold",
    className: STATUS_STYLES.neutral.chip,
  },
};

export const BenchmarkTable: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">
        The firm against the OSB's published figures
      </CardTitle>
      <p className="text-sm text-muted-foreground">
        The comparison the regulator is making. Where the OSB has not published a
        threshold, the row says so rather than inventing one.
      </p>
    </CardHeader>
    <CardContent className="p-0">
      <div className="divide-y">
        {SECTION_C.map((b) => {
          const badge = BADGE[b.badge];
          const firm =
            b.firmDisplay ?? (b.unit === "percent" ? `${b.firmValue}%` : `${b.firmValue}`);
          const published =
            b.publishedDisplay ??
            (b.publishedValue > 0
              ? b.unit === "percent"
                ? `${b.publishedValue}%`
                : `${b.publishedValue}`
              : "—");
          return (
            <div key={b.id} className="p-4 sm:flex sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium">{b.label}</p>
                <p className="text-xs text-muted-foreground">
                  {b.source} · as of {b.asOf}
                </p>
                {b.subtext && (
                  <p className="text-xs text-muted-foreground mt-1">{b.subtext}</p>
                )}
              </div>
              <div className="mt-2 flex items-center gap-6 sm:mt-0">
                <div className="text-right">
                  <p className="text-[11px] uppercase text-muted-foreground">Firm</p>
                  <p className="text-lg font-semibold tabular-nums">{firm}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase text-muted-foreground">Published</p>
                  <p className="text-lg font-semibold tabular-nums text-muted-foreground">
                    {published}
                  </p>
                </div>
                <Badge variant="outline" className={badge.className}>
                  {badge.label}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);
