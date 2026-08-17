import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RecordDrawer, Register } from "@/components/estate/forms/RecordForm";
import { assetSections } from "@/data/estateFormSpecs";
import { assets } from "@/data/estateWorkspace";

const money = (n: number) => `$${n.toLocaleString()}`;

export const AssetsTab = () => {
  const [editing, setEditing] = useState<(typeof assets)[number] | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <Register
      title="Assets"
      description="Sworn SOA values are locked by default; encumbrances reference creditor records."
      action={
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add asset
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {assets.map((a) => (
          <Card key={a.id}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{a.name}</CardTitle>
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3" /> SOA locked
            </Badge>
            <Button className="ml-auto" size="sm" variant="outline" onClick={() => setEditing(a)}>
              Edit
            </Button>
          </div>
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

      <RecordDrawer
        open={adding || Boolean(editing)}
        onOpenChange={(o) => {
          if (!o) {
            setAdding(false);
            setEditing(null);
          }
        }}
        title={editing ? `Edit ${editing.name}` : "Add asset"}
        sections={assetSections}
        initial={
          editing
            ? {
                description: editing.name,
                soaValue: editing.estimated,
                estimated: editing.estimated,
                amountToRealize: editing.realizable,
                sellingCosts: editing.sellingCosts,
                encumbered: editing.security.length > 0,
              }
            : {}
        }
        submitLabel="Save asset"
        onSubmit={() => toast({ title: "Asset saved" })}
      />
    </Register>
  );
};
