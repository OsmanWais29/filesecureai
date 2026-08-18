// Phase 5 — asset register persistence with net realizable value derivation.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { RecordValues } from "@/components/estate/forms/RecordForm";
import { logEstateEvent } from "@/hooks/useEstateRecords";

const db = supabase as unknown as { from: (table: string) => any };

const requireUser = async () => {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("You must be signed in to work on estates.");
  return data.user;
};

const num = (v: RecordValues[string]) => Number(v ?? 0) || 0;
const str = (v: RecordValues[string]) => (v == null || v === "" ? null : String(v));
const bool = (v: RecordValues[string]) => Boolean(v);

export interface AssetSecurityRow {
  id: string;
  creditor_id: string | null;
  creditor_name: string | null;
  rank: number;
  amount: number;
}

export interface EstateAssetRow {
  id: string;
  asset_type: string | null;
  description: string;
  soa_value: number;
  original_cost: number;
  soa_unlocked: boolean;
  estimated: number;
  amount_to_realize: number;
  amount_deposited: number;
  disposition: string | null;
  disposition_date: string | null;
  completed: boolean;
  exempt: boolean;
  exemption_status: string | null;
  buy_back: boolean;
  not_sold: boolean;
  not_sold_reason: string | null;
  rd_notes: string | null;
  print_on_rd: boolean;
  encumbered: boolean;
  selling_costs: number;
  exempt_amount: number;
  third_party_interest: number;
  estate_asset_securities?: AssetSecurityRow[];
}

/** Net realizable value = realization less security, selling costs, exemptions and third-party interests. */
export const netRealizable = (a: EstateAssetRow) =>
  a.amount_to_realize -
  (a.estate_asset_securities ?? []).reduce((s, x) => s + Number(x.amount || 0), 0) -
  a.selling_costs -
  a.exempt_amount -
  a.third_party_interest;

export const useEstateAssets = (estateId?: string) =>
  useQuery({
    queryKey: ["estate_assets", estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<EstateAssetRow[]> => {
      const { data, error } = await db
        .from("estate_assets")
        .select("*, estate_asset_securities(id, creditor_id, creditor_name, rank, amount)")
        .eq("estate_id", estateId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EstateAssetRow[];
    },
  });

export const assetToValues = (a: EstateAssetRow): RecordValues => ({
  assetType: a.asset_type ?? "",
  description: a.description,
  soaValue: a.soa_value,
  originalCost: a.original_cost,
  soaUnlocked: a.soa_unlocked,
  estimated: a.estimated,
  amountToRealize: a.amount_to_realize,
  amountDeposited: a.amount_deposited,
  disposition: a.disposition ?? "",
  dispositionDate: a.disposition_date ?? "",
  completed: a.completed,
  exempt: a.exempt,
  exemptionStatus: a.exemption_status ?? "",
  buyBack: a.buy_back,
  notSold: a.not_sold,
  notSoldReason: a.not_sold_reason ?? "",
  rdNotes: a.rd_notes ?? "",
  printOnRD: a.print_on_rd,
  encumbered: a.encumbered,
  sellingCosts: a.selling_costs,
  exemptAmount: a.exempt_amount,
  thirdPartyInterest: a.third_party_interest,
});

export const useSaveAsset = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ values, id }: { values: RecordValues; id?: string }) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      const row = {
        asset_type: str(values.assetType),
        description: str(values.description) ?? "Unnamed asset",
        original_cost: num(values.originalCost),
        soa_unlocked: bool(values.soaUnlocked),
        estimated: num(values.estimated),
        amount_to_realize: num(values.amountToRealize),
        amount_deposited: num(values.amountDeposited),
        disposition: str(values.disposition),
        disposition_date: str(values.dispositionDate),
        completed: bool(values.completed),
        exempt: bool(values.exempt),
        exemption_status: str(values.exemptionStatus),
        buy_back: bool(values.buyBack),
        not_sold: bool(values.notSold),
        not_sold_reason: str(values.notSoldReason),
        rd_notes: str(values.rdNotes),
        print_on_rd: bool(values.printOnRD),
        encumbered: bool(values.encumbered),
        selling_costs: num(values.sellingCosts),
        exempt_amount: num(values.exemptAmount),
        third_party_interest: num(values.thirdPartyInterest),
      } as Record<string, unknown>;

      // The sworn SOA value only moves when the trustee deliberately unlocks it.
      if (!id || bool(values.soaUnlocked)) {
        row.soa_value = num(values.soaValue) || num(values.estimated);
      }

      const query = id
        ? db.from("estate_assets").update(row).eq("id", id)
        : db.from("estate_assets").insert({ ...row, estate_id: estateId, user_id: user.id });
      const { data, error } = await query.select().single();
      if (error) throw error;
      await logEstateEvent({
        estateId,
        eventType: id ? "estate.asset.updated" : "estate.asset.created",
        after: data,
      });
      return data as EstateAssetRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate_assets", estateId] });
      toast({ title: "Asset saved" });
    },
    onError: (e: Error) =>
      toast({ title: "Could not save asset", description: e.message, variant: "destructive" }),
  });
};

export const useSaveAssetSecurity = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      assetId: string;
      creditorId?: string | null;
      creditorName?: string | null;
      rank: number;
      amount: number;
    }) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      const { data, error } = await db
        .from("estate_asset_securities")
        .insert({
          estate_id: estateId,
          user_id: user.id,
          asset_id: input.assetId,
          creditor_id: input.creditorId ?? null,
          creditor_name: input.creditorName ?? null,
          rank: input.rank,
          amount: input.amount,
        })
        .select()
        .single();
      if (error) throw error;
      await logEstateEvent({ estateId, eventType: "estate.asset_security.created", after: data });
      return data as AssetSecurityRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate_assets", estateId] });
      toast({ title: "Security interest recorded" });
    },
    onError: (e: Error) =>
      toast({ title: "Could not record security", description: e.message, variant: "destructive" }),
  });
};

export const useDeleteAssetSecurity = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("estate_asset_securities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["estate_assets", estateId] }),
  });
};
