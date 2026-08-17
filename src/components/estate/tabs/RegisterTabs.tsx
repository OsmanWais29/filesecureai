import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { activity, communications, compliance, forms, incomePeriods } from "@/data/estateWorkspace";

export const FormsTab = () => (
  <div className="grid gap-3 md:grid-cols-2">
    {forms.map((f) => (
      <Card key={f.id}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {f.number} — {f.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-sm">
          <Badge variant="outline">{f.status}</Badge>
          <Badge variant={f.validation === "Passed" ? "secondary" : "destructive"}>{f.validation}</Badge>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const IncomeTab = () => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base">Form 65 lifecycle & surplus income</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2 text-sm">
      <div className="grid grid-cols-5 gap-2 text-xs uppercase text-muted-foreground">
        <span>Period</span>
        <span>Income</span>
        <span>Expenses</span>
        <span>Surplus</span>
        <span>Status</span>
      </div>
      {incomePeriods.map((p) => (
        <div key={p.period} className="grid grid-cols-5 gap-2 rounded-md border p-2">
          <span>{p.period}</span>
          <span>${p.income.toLocaleString()}</span>
          <span>${p.expenses.toLocaleString()}</span>
          <span>${p.surplus.toLocaleString()}</span>
          <span className={p.status === "Missing" ? "text-destructive" : ""}>{p.status}</span>
        </div>
      ))}
    </CardContent>
  </Card>
);

export const CommunicationsTab = () => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base">Communication history</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2 text-sm">
      {communications.map((c) => (
        <div key={c.id} className="rounded-md border p-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{c.channel}</Badge>
            <span className="font-medium">{c.subject}</span>
            <span className="ml-auto text-xs text-muted-foreground">{c.date}</span>
          </div>
          <p className="mt-1 text-muted-foreground">
            {c.party} · {c.address}
          </p>
        </div>
      ))}
    </CardContent>
  </Card>
);

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
