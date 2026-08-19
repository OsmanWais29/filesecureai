import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CalendarClock, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { EstateSummary } from "@/data/estateWorkspace";
import { useEstateCompliance } from "@/hooks/useEstateCompliance";
import { statusTone } from "@/components/estate/StatusBadge";

interface Props {
  estate: EstateSummary;
  estateId?: string;
  officeManager?: string;
}

export const EstateWorkspaceHeader = ({ estate, estateId, officeManager }: Props) => {
  const { rules, failing, warning, score } = useEstateCompliance(estateId);
  const complianceLabel = failing.length ? "Blocked" : warning.length ? "Attention Required" : "Complete";
  const openSignals = failing.length + warning.length;

  return (
    <header className="border-b bg-card px-6 py-3">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-xl font-semibold tracking-tight">{estate.debtorName}</h1>
            <span className="text-sm text-muted-foreground">Estate #{estate.estateNumber}</span>
            <span className="text-sm text-muted-foreground">
              {estate.proceeding} · {estate.status}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {estate.office} · Trustee: {estate.trustee}
            {officeManager ? ` · Office Manager: ${officeManager}` : ""} · Administrator: {estate.administrator}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={statusTone(complianceLabel)}>
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            Compliance: {complianceLabel}
          </Badge>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7">
                <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                {openSignals} Open Signals
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Compliance score</span>
                <span className="text-sm text-muted-foreground">{score}%</span>
              </div>
              <Progress value={score} className="mb-4 h-2" />
              <ul className="space-y-2 text-sm">
                {rules.map((c) => (
                  <li key={c.id} className="flex items-start gap-2">
                    {c.state === "pass" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />}
                    {c.state === "warn" && <AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" />}
                    {c.state === "fail" && <XCircle className="mt-0.5 h-4 w-4 text-destructive" />}
                    <div>
                      <div>{c.rule}</div>
                      <div className="text-xs text-muted-foreground">{c.source}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>

          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            Next Critical Date: {estate.nextDeadline}
          </span>
        </div>
      </div>
    </header>
  );
};
