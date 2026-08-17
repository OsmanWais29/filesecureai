import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { assets } from "@/data/estateWorkspace";

const money = (n: number) => `$${n.toLocaleString()}`;

export const AssetsTab = () => (
  <div className="grid gap-4 md:grid-cols-2">
    {assets.map((a) => (
      <Card key={a.id}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{a.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated value</span>
            <span>{money(a.estimated)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Realizable value</span>
            <span>{money(a.realizable)}</span>
          </div>
          <p className="pt-2 text-xs uppercase text-muted-foreground">Security</p>
          {a.security.length === 0 && <p className="text-muted-foreground">Unencumbered</p>}
          {a.security.map((s) => (
            <div key={s.rank} className="flex justify-between">
              <span className="text-muted-foreground">
                Rank {s.rank} · {s.creditor}
              </span>
              <span>{money(s.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Selling costs</span>
            <span>{money(a.sellingCosts)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Net realizable</span>
            <span>{money(a.net)}</span>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
