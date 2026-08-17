import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { activity, compliance } from "@/data/estateWorkspace";

export const ComplianceTab = () => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base">Deterministic compliance rules</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2 text-sm">
      {compliance.map((c) => (
        <div key={c.id} className="flex items-start gap-3 rounded-md border p-3">
          {c.state === "pass" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />}
          {c.state === "warn" && <AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" />}
          {c.state === "fail" && <XCircle className="mt-0.5 h-4 w-4 text-destructive" />}
          <div>
            <div className="font-medium">{c.rule}</div>
            <div className="text-xs text-muted-foreground">
              {c.source} · due {c.due}
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

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
