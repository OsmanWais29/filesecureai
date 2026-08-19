import { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

/** Standard estate page header: heading, one-line description, primary actions. */
export const PageHeading = ({ title, description, actions, children }: Props) => (
  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
    <div className="min-w-0">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      {children}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

/** Compact metric strip — used instead of a row of oversized cards. */
export const MetricStrip = ({
  items,
}: {
  items: { label: string; value: string; tone?: "default" | "warn" | "bad" }[];
}) => (
  <div className="mb-5 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-4">
    {items.map((i) => (
      <div key={i.label} className="bg-card px-4 py-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{i.label}</div>
        <div
          className={
            i.tone === "bad"
              ? "mt-1 text-xl font-semibold text-destructive"
              : i.tone === "warn"
                ? "mt-1 text-xl font-semibold text-foreground"
                : "mt-1 text-xl font-semibold"
          }
        >
          {i.value}
        </div>
      </div>
    ))}
  </div>
);