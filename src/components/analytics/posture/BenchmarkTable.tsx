import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SECTION_C } from "@/data/analytics/postureData";
import { STATUS_STYLES } from "./statusStyles";

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
          const published = b.publishedValue > 0;
          const ahead = published
            ? b.betterWhen === "lower"
              ? b.firmValue <= b.publishedValue
              : b.firmValue >= b.publishedValue
            : null;
          return (
            <div key={b.id} className="p-4 sm:flex sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium">{b.label}</p>
                <p className="text-xs text-muted-foreground">
                  {b.source} · as of {b.asOf}
                </p>
              </div>
              <div className="mt-2 flex items-center gap-6 sm:mt-0">
                <div className="text-right">
                  <p className="text-[11px] uppercase text-muted-foreground">Firm</p>
                  <p className="text-lg font-semibold tabular-nums">{b.firmValue}%</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase text-muted-foreground">Published</p>
                  <p className="text-lg font-semibold tabular-nums text-muted-foreground">
                    {published ? `${b.publishedValue}%` : "—"}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    ahead === null
                      ? STATUS_STYLES.neutral.chip
                      : ahead
                      ? STATUS_STYLES.compliant.chip
                      : STATUS_STYLES.watch.chip
                  }
                >
                  {ahead === null
                    ? "No published threshold"
                    : ahead
                    ? "Ahead of national"
                    : "Behind national"}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);
