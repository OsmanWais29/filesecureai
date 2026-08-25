import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Calm, low-density page header for client-facing screens. */
export const ClientPageHeading = ({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) => (
  <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
    <div className="min-w-0">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

/** Plain-language status vocabulary for clients — no internal risk language. */
export const clientTone = (label: string) => {
  switch (label) {
    case "Action Required":
    case "More Information Needed":
    case "Needs replacement":
    case "Failed":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "Completed":
    case "Accepted":
    case "Active":
    case "Paid":
      return "border-accent/40 bg-accent/10 text-accent";
    case "Submitted":
    case "Under Review":
    case "Under review":
    case "In Progress":
    case "Processing":
    case "Draft":
      return "border-primary/30 bg-primary/10 text-primary";
    default:
      return "border-border bg-muted/60 text-muted-foreground";
  }
};

export const ClientStatusBadge = ({ label, className }: { label: string; className?: string }) => (
  <Badge variant="outline" className={cn("font-medium", clientTone(label), className)}>
    {label}
  </Badge>
);

export const EmptyState = ({ title, body, icon }: { title: string; body?: string; icon?: ReactNode }) => (
  <div className="rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center">
    {icon && <div className="mb-3 flex justify-center text-muted-foreground">{icon}</div>}
    <p className="font-medium text-foreground">{title}</p>
    {body && <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{body}</p>}
  </div>
);

export const formatMoney = (n: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 }).format(n);

export const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" }) : "—";

export const formatDateTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-CA", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "—";

export const dueLabel = (iso?: string) => {
  if (!iso) return null;
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  if (days < 0) return { text: `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`, urgent: true };
  if (days === 0) return { text: "Due today", urgent: true };
  if (days <= 7) return { text: `Due in ${days} day${days === 1 ? "" : "s"}`, urgent: true };
  return { text: `Due ${formatDate(iso)}`, urgent: false };
};

/** Simulation banner — never let a demo connection look like a real bank link. */
export const SimulationNotice = ({ children }: { children: ReactNode }) => (
  <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
    {children}
  </div>
);
