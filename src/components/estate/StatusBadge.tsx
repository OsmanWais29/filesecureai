import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type EstateStatusLabel =
  | "Complete"
  | "In Progress"
  | "Attention Required"
  | "Blocked"
  | "Missing"
  | "Human Review"
  | "Overdue";

/** One vocabulary and one colour scheme for every estate status across modules. */
export const statusTone = (label: string) => {
  switch (label) {
    case "Complete":
      return "border-primary/30 bg-primary/10 text-primary";
    case "Blocked":
    case "Overdue":
    case "Missing":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "Attention Required":
    case "Human Review":
      return "border-muted-foreground/30 bg-muted text-foreground";
    default:
      return "border-border bg-muted/50 text-muted-foreground";
  }
};

export const StatusBadge = ({ label, className }: { label: string; className?: string }) => (
  <Badge variant="outline" className={cn(statusTone(label), className)}>
    {label}
  </Badge>
);