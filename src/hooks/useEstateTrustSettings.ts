import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logEstateEvent } from "./useEstateRecords";

export interface TrustSettings {
  estate_id: string;
  account_type: "individual_estate" | "consolidated_summary" | "consolidated_proposal";
  account_holder: string | null;
  superintendent_approval_ref: string | null;
  superintendent_approval_date: string | null;
  fee_basis: "tariff" | "court_approved" | "inspector_approved" | null;
  approved_fee_amount: number | null;
  tariff_base: number | null;
  levy_basis: number | null;
  proposal_filed: boolean | null;
  proposal_approved: boolean | null;
  schedule_amount: number | null;
  schedule_frequency: "weekly" | "biweekly" | "monthly" | null;
  schedule_first_due: string | null;
  schedule_last_due: string | null;
  pooled_coverage_confirmed_by: string | null;
  pooled_coverage_confirmed_on: string | null;
  second_approval_limit: number | null;
}

const table = () => (supabase as any).from("estate_trust_settings");

export function useEstateTrustSettings(estateId?: string) {
  return useQuery({
    queryKey: ["estate_trust_settings", estateId], enabled: Boolean(estateId),
    queryFn: async () => {
      const { data, error } = await table().select("*").eq("estate_id", estateId).maybeSingle();
      if (error) throw error;
      return (data ?? null) as TrustSettings | null;
    },
  });
}

export function useSaveTrustSettings(estateId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ next, before }: { next: Omit<TrustSettings, "estate_id">; before: TrustSettings | null }) => {
      if (!estateId) throw new Error("Select an estate first.");
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await table().upsert({ ...next, estate_id: estateId, updated_by: u.user?.id ?? null }).select().maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("You don't have permission to change this estate's trust settings.");
      await logEstateEvent({ estateId, eventType: "estate.trust_settings.saved", before, after: data });
      return data as TrustSettings;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["estate_trust_settings", estateId] }),
  });
}
