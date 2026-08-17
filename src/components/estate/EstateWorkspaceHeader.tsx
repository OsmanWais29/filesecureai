import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CalendarClock, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { EstateSummary, compliance } from "@/data/estateWorkspace";

interface Props {
  estate: EstateSummary;
}

export const EstateWorkspaceHeader = ({ estate }: Props) => {
  const osbLabel =
    estate.osbStatus === "in_good_standing"
      ? "OSB Status: In Good Standing"
      : estate.osbStatus === "attention"
      ? "OSB Status: Attention Required"
      : "OSB Status: Blocked";

  return (
    <header className="border-b bg-card px-6 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{estate.debtorName}</h1>
            <Badge variant="outline">Estate #{estate.estateNumber}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {estate.proceeding} · {estate.division} · {estate.status}
          </p>
          <p className="text-sm text-muted-foreground">
            Trustee: {estate.trustee} · Administrator: {estate.administrator} · {estate.office}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={
              estate.osbStatus === "in_good_standing"
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }
          >
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            {osbLabel}
          </Badge>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                {estate.openIssues} Issues
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">OSB Readiness</span>
                <span className="text-sm text-muted-foreground">{estate.osbReadiness}%</span>
              </div>
              <Progress value={estate.osbReadiness} className="mb-4 h-2" />
              <ul className="space-y-2 text-sm">
                {compliance.map((c) => (
                  <li key={c.id} className="flex items-start gap-2">
                    {c.state === "pass" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />}
                    {c.state === "warn" && <AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" />}
                    {c.state === "fail" && <XCircle className="mt-0.5 h-4 w-4 text-destructive" />}
                    <div>
                      <div>{c.rule}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.source} · due {c.due}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>

          <Badge variant="secondary" className="gap-1">
            <CalendarClock className="h-3.5 w-3.5" />
            Next Deadline: {estate.nextDeadline}
          </Badge>
        </div>
      </div>
    </header>
  );
};
