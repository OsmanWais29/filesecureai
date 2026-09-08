import type { MetricStatus } from "@/data/analytics/postureData";

/**
 * Semantic colour only: red means a breached obligation, never "below target".
 */
export const STATUS_STYLES: Record<
  MetricStatus,
  { dot: string; text: string; chip: string; label: string }
> = {
  breach: {
    dot: "bg-destructive",
    text: "text-destructive",
    chip: "bg-destructive/10 text-destructive border-destructive/30",
    label: "Obligation breached",
  },
  watch: {
    dot: "bg-warning",
    text: "text-warning",
    chip: "bg-warning/10 text-warning border-warning/30",
    label: "Exposure — not yet a breach",
  },
  compliant: {
    dot: "bg-accent",
    text: "text-accent",
    chip: "bg-accent/10 text-accent border-accent/30",
    label: "Obligation met",
  },
  neutral: {
    dot: "bg-muted-foreground",
    text: "text-foreground",
    chip: "bg-muted text-muted-foreground border-border",
    label: "Operational measure",
  },
};
