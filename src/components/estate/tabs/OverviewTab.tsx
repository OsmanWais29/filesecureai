import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { EstateSummary } from "@/data/estateWorkspace";
import { StatusBadge } from "@/components/estate/StatusBadge";
import { useEstateSignals } from "@/hooks/useEstateSignals";
import { displayValue, isKnown, locationHref } from "@/data/estateFieldState";

interface Props {
  estate: EstateSummary;
  estateId?: string;
}

/**
 * Overview reports only what the estate record can support. An estate with no
 * data renders as intentionally empty rather than as a healthy estate.
 */
export const OverviewTab = ({ estateId }: Props) => {
  const { isLoading, canAssess, missing, signals, health, healthComponents } =
    useEstateSignals(estateId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading estate state…
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Estate health</CardTitle>
        </CardHeader>
        <CardContent>
          {canAssess ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{displayValue(health)}%</span>
                <span className="text-sm text-muted-foreground">
                  {healthComponents.filter((c) => c.ok).length} of {healthComponents.length} conditions met
                </span>
              </div>
              <Progress value={isKnown(health) ? (health.value as number) : 0} className="mt-3 h-2" />
              <ul className="mt-4 space-y-1.5 text-sm">
                {healthComponents.map((c) => (
                  <li key={c.label} className="flex items-start gap-2">
                    {c.ok ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={c.ok ? "" : "text-muted-foreground"}>{c.label}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="space-y-3">
              <StatusBadge label="Blocked" reason="Estate health cannot be assessed yet" />
              <p className="text-sm text-muted-foreground">
                The following information is required before the rules engine can evaluate this estate:
              </p>
              <ul className="space-y-1.5 text-sm">
                {missing.map((m) => (
                  <li key={m.label} className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    {m.to ? (
                      <Link
                        to={locationHref(estateId, m.to)}
                        className="font-medium text-primary hover:underline"
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
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Signals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {signals.length === 0 ? (
            <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              No signals. Signals appear when a rule evaluates against recorded estate data.
            </p>
          ) : (
            signals.map((s) => (
              <Link
                key={s.id}
                to={locationHref(estateId, s.to)}
                className="flex items-start gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50"
              >
                {s.severity === "exception" ? (
                  <XCircle className="mt-0.5 h-4 w-4 text-destructive" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{s.title}</span>
                    <StatusBadge label={s.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{s.detail}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.source}</p>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
