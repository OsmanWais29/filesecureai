import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useTrustLedger } from "@/lib/trust/trustStore";
import { trustRiskFlags } from "@/lib/trust/trustLedger";

export function TrustRiskFlags({ onOpenTrust }: { onOpenTrust: () => void }) {
  const l = useTrustLedger();
  const flags = trustRiskFlags(l, new Date().toISOString().slice(0, 10));
  const order = { high: 0, medium: 1, low: 2 } as const;
  flags.sort((a, b) => order[a.severity] - order[b.severity]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Risk flags — trust account</CardTitle>
        <CardDescription>Computed live from the trust ledger and reconciliations (Directive 5R8).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {flags.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center"><CheckCircle2 className="h-4 w-4 text-primary" /> No trust-account risks detected.</div>
        )}
        {flags.map((f) => (
          <div key={f.code} className="flex items-start justify-between gap-4 rounded-md border p-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={f.severity === "high" ? "destructive" : "outline"} className={f.severity === "medium" ? "border-warning text-warning" : ""}>{f.severity}</Badge>
                <span className="font-medium text-sm">{f.title}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{f.detail}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{f.citation}</p>
            </div>
            <Button size="sm" variant="outline" onClick={onOpenTrust}>Open trust account</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
