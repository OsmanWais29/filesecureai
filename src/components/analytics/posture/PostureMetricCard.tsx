import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";
import { PostureMetric, formatRatio, ratioDetail } from "@/data/analytics/postureData";
import { STATUS_STYLES } from "./statusStyles";

interface Props {
  metric: PostureMetric;
  asOf: string;
  onSelect: (metric: PostureMetric) => void;
  /** Section B carries no status colour. */
  hideDot?: boolean;
}

export const PostureMetricCard: React.FC<Props> = ({ metric, asOf, onSelect, hideDot }) => {
  const style = STATUS_STYLES[metric.status];
  const detail = ratioDetail(metric);

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            role="button"
            tabIndex={0}
            onClick={() => onSelect(metric)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(metric)}
            className="cursor-pointer transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-snug">{metric.label}</p>
                {!hideDot && (
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-semibold tabular-nums ${
                    hideDot ? "text-foreground" : style.text
                  }`}
                >
                  {formatRatio(metric)}
                </span>
                {detail && (
                  <span className="text-xs text-muted-foreground tabular-nums">{detail}</span>
                )}
              </div>

              {metric.secondLine && (
                <p className="text-xs text-muted-foreground leading-snug">{metric.secondLine}</p>
              )}

              {metric.citation && (
                <p className="text-[11px] leading-snug text-muted-foreground line-clamp-2">
                  {metric.citation}
                </p>
              )}

              {metric.aiDerived && (
                <Badge variant="outline" className={STATUS_STYLES.watch.chip}>
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI-derived · sign-off{" "}
                  {metric.signOff === "signed" ? "recorded" : "pending"}
                </Badge>
              )}
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-medium">{metric.label}</p>
          <p className="mt-1 text-xs">
            Numerator {metric.numerator} · denominator {metric.denominator} · as of {asOf}
          </p>
          <p className="mt-1 text-xs">{metric.statusReason}</p>
          <p className="mt-1 text-xs opacity-80">Click to open the files behind this number.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
