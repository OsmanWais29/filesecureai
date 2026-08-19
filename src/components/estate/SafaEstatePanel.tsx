import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sparkles, MessageSquare, Wand2, PanelRightClose, PanelRightOpen } from "lucide-react";
import { EstateSummary } from "@/data/estateWorkspace";
import { useEstateSignals } from "@/hooks/useEstateSignals";
import { displayValue, isKnown, locationHref } from "@/data/estateFieldState";
import { StatusBadge } from "@/components/estate/StatusBadge";

interface Props {
  estate: EstateSummary;
  estateId?: string;
  context: string;
  /** Human-readable "Module › Subpage" the user is currently working in. */
  scope?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

export const SafaEstatePanel = ({ estate, estateId, scope, collapsed, onToggle }: Props) => {
  const { canAssess, missing, signals, health } = useEstateSignals(estateId);
  const scoped = signals.filter((s) => s.severity !== "insight");

  if (collapsed) {
    return (
      <aside className="hidden w-12 shrink-0 border-l bg-card py-3 xl:block">
        <Button variant="ghost" size="icon" className="mx-auto flex" onClick={onToggle} aria-label="Open SAFA">
          <PanelRightOpen className="h-4 w-4" />
        </Button>
        <Sparkles className="mx-auto mt-3 h-4 w-4 text-primary" />
      </aside>
    );
  }

  return (
    <aside className="hidden w-80 shrink-0 overflow-y-auto border-l bg-card p-4 xl:block">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-semibold">SAFA</span>
        <Button variant="ghost" size="icon" className="ml-auto h-7 w-7" onClick={onToggle} aria-label="Collapse SAFA">
          <PanelRightClose className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
        <Badge variant="outline" className="text-[10px]">
          #{estate.estateNumber}
        </Badge>
        {scope && <span className="truncate">{scope}</span>}
      </div>

      <Card className="mt-4 border-primary/20 bg-primary/5">
        <CardContent className="space-y-2 p-3 text-sm">
          <div className="font-medium">Estate assessment</div>
          {canAssess ? (
            <p className="text-muted-foreground">
              {scoped.length === 0
                ? "No open exceptions are recorded against this estate."
                : `${scoped.length} item${scoped.length === 1 ? "" : "s"} recorded against this estate require action.`}
            </p>
          ) : (
            <>
              <StatusBadge label="Blocked" reason="Unable to assess" />
              <p className="text-muted-foreground">Required information is missing:</p>
              <ul className="space-y-1">
                {missing.map((m) => (
                  <li key={m.label}>
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
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="font-medium">Estate health</span>
        <span className="text-muted-foreground">
          {isKnown(health) ? `${displayValue(health)}%` : "Not enough information"}
        </span>
      </div>

      <Separator className="my-4" />

      {scoped.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          SAFA reports observations only when the estate record supports them.
        </p>
      ) : (
        <ul className="space-y-2">
          {scoped.slice(0, 8).map((s) => (
            <li key={s.id}>
              <Link
                to={locationHref(estateId, s.to)}
                className="block rounded-md border p-2 transition-colors hover:bg-muted/50"
              >
                <div className="text-sm font-medium">{s.title}</div>
                <div className="mt-1">
                  <StatusBadge label={s.status} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.source}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-2">
        <Button variant="outline" className="w-full justify-start" size="sm">
          <MessageSquare className="mr-2 h-4 w-4" /> Ask this estate
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Wand2 className="mr-2 h-4 w-4" /> Prepare action
        </Button>
      </div>
    </aside>
  );
};
