import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Computed, blockedReason, displayValue, isKnown, locationHref } from "@/data/estateFieldState";
import { StatusBadge } from "@/components/estate/StatusBadge";

interface Props<T> {
  label: string;
  computed: Computed<T>;
  format?: (v: T) => string;
  estateId?: string;
  className?: string;
}

/**
 * Renders a computed estate value with its state. A blocked value shows the
 * missing dependencies and deep-links to where they can be supplied — it is
 * never rendered as zero.
 */
export function ComputedValue<T>({ label, computed, format, estateId, className }: Props<T>) {
  const known = isKnown(computed);
  const reason = blockedReason(computed);

  return (
    <div className={cn("bg-card px-4 py-3", className)}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-xl font-semibold", !known && "text-muted-foreground")}>
        {displayValue(computed, format)}
      </div>
      {!known && (
        <div className="mt-1.5 space-y-1">
          <StatusBadge label={computed.state === "BLOCKED" ? "Blocked" : "Unverified"} />
          {reason && <p className="text-xs text-muted-foreground">{reason}</p>}
          {computed.blockedBy
            .filter((b) => b.to)
            .map((b) => (
              <Link
                key={b.label}
                to={locationHref(estateId, b.to!)}
                className="block text-xs font-medium text-primary hover:underline"
              >
                Add {b.label.toLowerCase()}
              </Link>
            ))}
        </div>
      )}
      {known && computed.state === "STALE" && (
        <div className="mt-1.5">
          <StatusBadge label="Stale" />
        </div>
      )}
      {known && computed.provenance === "EXTRACTED" && computed.confidence != null && (
        <p className="mt-1 text-xs text-muted-foreground">
          Extracted · confidence {Math.round(computed.confidence * 100)}%
        </p>
      )}
    </div>
  );
}

export const ComputedStrip = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-5 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-4">
    {children}
  </div>
);