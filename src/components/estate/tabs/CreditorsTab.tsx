import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { creditors } from "@/data/estateWorkspace";

const money = (n: number) => `$${n.toLocaleString()}`;

export const CreditorsTab = () => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      Estate claim records reference the creditor master identity; address changes propagate while
      historical communications keep their address snapshot.
    </p>
    {creditors.map((c) => {
      const variance = c.filed - c.soa;
      return (
        <Card key={c.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{c.name}</CardTitle>
              <Badge variant="outline">{c.priority}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <dl className="space-y-1.5 text-sm">
              {[
                ["SOA", c.soa],
                ["Filed", c.filed],
                ["Admitted", c.admitted],
                ["Voting", c.voting],
                ["Dividend Eligible", c.dividend],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <dt className="text-muted-foreground">{label as string}</dt>
                  <dd>{money(value as number)}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t pt-1.5 font-medium">
                <dt>Variance</dt>
                <dd className={variance !== 0 ? "text-destructive" : ""}>
                  {variance > 0 ? "+" : ""}
                  {money(variance)}
                </dd>
              </div>
            </dl>
            <div className="space-y-2 text-sm">
              {c.note && <p className="rounded-md border border-destructive/30 bg-destructive/5 p-2">{c.note}</p>}
              <p className="text-xs uppercase text-muted-foreground">Evidence</p>
              <ul className="list-inside list-disc text-muted-foreground">
                {c.evidence.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
              <Button variant="outline" size="sm">Review</Button>
            </div>
          </CardContent>
        </Card>
      );
    })}
  </div>
);
