import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Lock, Unlock, X } from "lucide-react";
import { RecordDrawer, Register } from "@/components/estate/forms/RecordForm";
import { assetSections } from "@/data/estateFormSpecs";
import {
  assetToValues,
  netRealizable,
  useDeleteAssetSecurity,
  useEstateAssets,
  useSaveAsset,
  useSaveAssetSecurity,
  type EstateAssetRow,
} from "@/hooks/useEstateAssets";
import { useEstateCreditors } from "@/hooks/useEstateCreditors";

const money = (n: number) => `$${Number(n || 0).toLocaleString()}`;

const SecurityEditor = ({ asset, estateId }: { asset: EstateAssetRow; estateId?: string }) => {
  const { data: creditors = [] } = useEstateCreditors(estateId);
  const add = useSaveAssetSecurity(estateId);
  const remove = useDeleteAssetSecurity(estateId);
  const [creditorId, setCreditorId] = useState("");
  const [amount, setAmount] = useState("");
  const rows = [...(asset.estate_asset_securities ?? [])].sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-2">
      <p className="pt-2 text-xs uppercase text-muted-foreground">Security</p>
      {rows.length === 0 && <p className="text-muted-foreground">Unencumbered</p>}
      {rows.map((s) => (
        <div key={s.id} className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">
            Rank {s.rank} · {s.creditor_name ?? "Creditor"}
          </span>
          <span className="flex items-center gap-1">
            {money(s.amount)}
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => remove.mutate(s.id)}>
              <X className="h-3 w-3" />
            </Button>
          </span>
        </div>
      ))}
      <div className="flex gap-2">
        <select
          className="h-9 flex-1 rounded-md border bg-background px-2 text-sm"
          value={creditorId}
          onChange={(e) => setCreditorId(e.target.value)}
        >
          <option value="">Link creditor…</option>
          {creditors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.legal_name}
            </option>
          ))}
        </select>
        <Input
          className="h-9 w-28"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={!creditorId || !amount}
          onClick={() => {
            const creditor = creditors.find((c) => c.id === creditorId);
            add.mutate(
              {
                assetId: asset.id,
                creditorId,
                creditorName: creditor?.legal_name ?? null,
                rank: rows.length + 1,
                amount: Number(amount) || 0,
              },
              {
                onSuccess: () => {
                  setCreditorId("");
                  setAmount("");
                },
              }
            );
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export const AssetsTab = ({ estateId }: { estateId?: string }) => {
  const { data: assets = [], isLoading } = useEstateAssets(estateId);
  const save = useSaveAsset(estateId);
  const [editing, setEditing] = useState<EstateAssetRow | null>(null);
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
      {isLoading && <p className="text-sm text-muted-foreground">Loading assets…</p>}
      {!isLoading && assets.length === 0 && (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          No assets recorded yet. Add the first asset from the statement of affairs.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {assets.map((a) => (
          <Card key={a.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{a.description}</CardTitle>
                <Badge variant="outline" className="gap-1">
                  {a.soa_unlocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  SOA {a.soa_unlocked ? "unlocked" : "locked"}
                </Badge>
                <Button className="ml-auto" size="sm" variant="outline" onClick={() => setEditing(a)}>
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">SOA value</span>
                <span>{money(a.soa_value)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated value</span>
                <span>{money(a.estimated)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount to realize</span>
                <span>{money(a.amount_to_realize)}</span>
              </div>
              <SecurityEditor asset={a} estateId={estateId} />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Selling costs</span>
                <span>{money(a.selling_costs)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Net realizable</span>
                <span>{money(netRealizable(a))}</span>
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
        title={editing ? `Edit ${editing.description}` : "Add asset"}
        sections={assetSections}
        initial={editing ? assetToValues(editing) : {}}
        submitLabel="Save asset"
        onSubmit={(values) =>
          save.mutate(
            { values, id: editing?.id },
            {
              onSuccess: () => {
                setAdding(false);
                setEditing(null);
              },
            }
          )
        }
      />
    </Register>
  );
};
