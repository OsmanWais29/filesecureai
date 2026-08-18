import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { activity } from "@/data/estateWorkspace";
import { useEstateCompliance } from "@/hooks/useEstateCompliance";

export const ComplianceTab = ({ estateId }: { estateId?: string }) => {
  const { rules, failing, warning, passing } = useEstateCompliance(estateId);
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          Deterministic compliance rules
          <Badge variant="outline">{passing.length} passing</Badge>
          <Badge variant="outline">{warning.length} warnings</Badge>
          <Badge variant={failing.length ? "destructive" : "outline"}>{failing.length} failing</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {rules.length === 0 && (
          <p className="text-muted-foreground">No compliance rules evaluated for this estate yet.</p>
        )}
        {rules.map((c) => (
          <div key={c.id} className="flex items-start gap-3 rounded-md border p-3">
            {c.state === "pass" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />}
            {c.state === "warn" && <AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" />}
            {c.state === "fail" && <XCircle className="mt-0.5 h-4 w-4 text-destructive" />}
            <div>
              <div className="font-medium">{c.rule}</div>
              <div className="text-xs text-muted-foreground">{c.detail}</div>
              {c.source && <div className="text-xs text-muted-foreground">{c.source}</div>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export const ActivityTab = () => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base">Human + SAFA audit history</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2 text-sm">
      {activity.map((a) => (
        <div key={a.id} className="rounded-md border p-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{a.actor}</Badge>
            <span className="ml-auto text-xs text-muted-foreground">{a.at}</span>
          </div>
          <p className="mt-1 text-muted-foreground">{a.action}</p>
        </div>
      ))}
    </CardContent>
  </Card>
);
