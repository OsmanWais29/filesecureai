import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Reason-bearing operational vocabulary. "Attention Required" is deliberately absent. */
export type EstateStatusLabel =
  | "Complete"
  | "In Progress"
  | "Waiting"
  | "Blocked"
  | "Upcoming"
  | "Due Soon"
  | "Overdue"
  | "Unverified"
  | "Stale"
  | "Human Decision Required"
  | "Not Applicable"
  | "Missing";

/** One vocabulary and one colour scheme for every estate status across modules. */
export const statusTone = (label: string) => {
  switch (label) {
    case "Complete":
      return "border-primary/30 bg-primary/10 text-primary";
    case "Blocked":
    case "Overdue":
    case "Missing":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "Human Decision Required":
    case "Waiting":
    case "Unverified":
    case "Stale":
    case "Due Soon":
      return "border-muted-foreground/30 bg-muted text-foreground";
    default:
      return "border-border bg-muted/50 text-muted-foreground";
  }
};

export const StatusBadge = ({
  label,
  reason,
  className,
}: {
  label: string;
  /** Always show why, when the state is not self-explanatory. */
  reason?: string | null;
  className?: string;
}) => (
  <span className="inline-flex flex-wrap items-baseline gap-1.5">
    <Badge variant="outline" className={cn(statusTone(label), className)}>
      {label}
    </Badge>
    {reason && <span className="text-xs text-muted-foreground">{reason}</span>}
  </span>
);