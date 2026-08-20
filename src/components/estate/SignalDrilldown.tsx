import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/estate/StatusBadge";
import { useEstateSignals } from "@/hooks/useEstateSignals";
import { useEstateCompliance } from "@/hooks/useEstateCompliance";
import { displayValue, isKnown, locationHref } from "@/data/estateFieldState";
import { getModule, getPage } from "@/components/estate/estateNavigation";

export interface DrilldownScope {
  /** Restrict to signals routed at this module (and optionally page). */
  module?: string;
  page?: string;
  /** Override the drawer title. */
  title?: string;
}

interface Props {
  estateId?: string;
  scope: DrilldownScope | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Drilldown for a nav badge or header signal. Shows the underlying records,
 * the extracted/derived values behind each signal, and the calculation
 * dependencies that are missing or blocked. Never invents data.
 */
export const SignalDrilldown = ({ estateId, scope, onOpenChange }: Props) => {
  const { canAssess, missing, signals, health, healthComponents } = useEstateSignals(estateId);
  const { rules, score } = useEstateCompliance(estateId);

  const open = scope !== null;
  const moduleId = scope?.module;
  const pageId = scope?.page;

  const scoped = signals.filter((s) => {
    if (s.severity === "insight") return false;
    if (moduleId && s.to.module !== moduleId) return false;
    if (pageId && s.to.page !== pageId) return false;
    return true;
  });

  const title =
    scope?.title ??
    (moduleId
      ? pageId
        ? `${getModule(moduleId).label} › ${getPage(moduleId, pageId).label}`
        : getModule(moduleId).label
      : "Estate signals");

  const scopedRules = moduleId ? [] : rules;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {scoped.length === 0
              ? "No open items are recorded here."
              : `${scoped.length} open item${scoped.length === 1 ? "" : "s"} derived from estate records.`}
          </SheetDescription>
        </SheetHeader>

        {/* Assessment state and blocking dependencies */}
        <section className="mt-5 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estate health</span>
            <span className="text-sm text-muted-foreground">
              {isKnown(health) ? `${displayValue(health)}%` : "Not assessable"}
            </span>
          </div>
          {!canAssess && (
            <div className="mt-2 space-y-1.5">
              <StatusBadge label="Blocked" reason="Calculation dependencies missing" />
              <ul className="space-y-1 text-sm">
                {missing.map((m) => (
                  <li key={m.label}>
                    {m.to ? (
                      <Link
                        to={locationHref(estateId, m.to)}
                        onClick={() => onOpenChange(false)}
                        className="text-primary hover:underline"
                      >
                        {m.label}
                      </Link>
                    ) : (
                      m.label
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {canAssess && (
            <ul className="mt-2 space-y-1 text-sm">
              {healthComponents.map((c) => (
                <li key={c.label} className="flex items-start gap-2">
                  {c.ok ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <span className={c.ok ? "text-muted-foreground" : ""}>{c.label}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Separator className="my-5" />

        {/* Underlying records behind each signal */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium">Underlying records</h3>
          {scoped.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing outstanding is recorded against this scope.
            </p>
          ) : (
            <ul className="space-y-2">
              {scoped.map((s) => (
                <li key={s.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="text-sm font-medium">{s.title}</div>
                    <StatusBadge label={s.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.detail}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{s.source}</span>
                    <Link
                      to={locationHref(estateId, s.to)}
                      onClick={() => onOpenChange(false)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Open {getModule(s.to.module).label} ›{" "}
                      {getPage(s.to.module, s.to.page).label}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {scopedRules.length > 0 && (
          <>
            <Separator className="my-5" />
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Compliance rules</h3>
                <span className="text-sm text-muted-foreground">{score}%</span>
              </div>
              <Progress value={score} className="h-2" />
              <ul className="mt-2 space-y-2 text-sm">
                {scopedRules.map((r) => (
                  <li key={r.id} className="rounded-md border p-2.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <span className="font-medium">{r.rule}</span>
                      <StatusBadge
                        label={
                          r.state === "pass"
                            ? "Complete"
                            : r.state === "warn"
                              ? "Human Decision Required"
                              : "Blocked"
                        }
                      />
                    </div>
                    <p className="mt-1 text-muted-foreground">{r.detail}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{r.source}</p>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};