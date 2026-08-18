// Phases 8–9 — s.170 discharge report and gated estate closing.
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

const useSingleton = <T,>(table: string, estateId?: string) =>
  useQuery({
    queryKey: [table, estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<T | null> => {
      const { data, error } = await db
        .from(table)
        .select("*")
        .eq("estate_id", estateId)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as T | null;
    },
  });

// ------------------------------------------------------------------ discharge
export interface DischargeReportRow {
  id: string;
  estate_id: string;
  report_data: RecordValues;
  opposition: boolean;
  status: string;
  generated_at: string | null;
}

export const useDischargeReport = (estateId?: string) =>
  useSingleton<DischargeReportRow>("estate_discharge_reports", estateId);

export const useSaveDischargeReport = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      values,
      existing,
      generate,
    }: {
      values: RecordValues;
      existing?: DischargeReportRow | null;
      generate?: boolean;
    }) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      const row = {
        report_data: values as Record<string, unknown>,
        opposition: Boolean(
          values.trusteeOpposition || values.superintendentOpposition || values.creditorOpposition
        ),
        status: generate ? "generated" : "draft",
        generated_at: generate ? new Date().toISOString() : existing?.generated_at ?? null,
      };
      const query = existing
        ? db.from("estate_discharge_reports").update(row).eq("id", existing.id)
        : db
            .from("estate_discharge_reports")
            .insert({ ...row, estate_id: estateId, user_id: user.id });
      const { data, error } = await query.select().single();
      if (error) throw error;
      await logEstateEvent({
        estateId,
        eventType: `estate.discharge.${generate ? "generated" : "saved"}`,
        after: { opposition: row.opposition, status: row.status },
      });
      return data as DischargeReportRow;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["estate_discharge_reports", estateId] });
      qc.invalidateQueries({ queryKey: ["estate-events", estateId] });
      toast({ title: vars.generate ? "Form 82 generated" : "s.170 report saved" });
    },
    onError: (e: Error) =>
      toast({ title: "Could not save report", description: e.message, variant: "destructive" }),
  });
};

// -------------------------------------------------------------------- closing
export interface ClosingRow {
  id: string;
  estate_id: string;
  checklist: RecordValues;
  closing_date: string | null;
  closed: boolean;
  closed_at: string | null;
  notes: string | null;
}

export const useEstateClosing = (estateId?: string) =>
  useSingleton<ClosingRow>("estate_closings", estateId);

export const useSaveClosing = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      values,
      existing,
      close,
    }: {
      values: RecordValues;
      existing?: ClosingRow | null;
      close?: boolean;
    }) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      const row = {
        checklist: values as Record<string, unknown>,
        closing_date: values.certificateDate ? String(values.certificateDate) : null,
        closed: close ? true : existing?.closed ?? false,
        closed_at: close ? new Date().toISOString() : existing?.closed_at ?? null,
      };
      const query = existing
        ? db.from("estate_closings").update(row).eq("id", existing.id)
        : db.from("estate_closings").insert({ ...row, estate_id: estateId, user_id: user.id });
      const { data, error } = await query.select().single();
      if (error) throw error;
      if (close) {
        await db.from("estates").update({ status: "closed" }).eq("id", estateId);
      }
      await logEstateEvent({
        estateId,
        eventType: `estate.closing.${close ? "closed" : "saved"}`,
        after: row.checklist,
      });
      return data as ClosingRow;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["estate_closings", estateId] });
      qc.invalidateQueries({ queryKey: ["estate-row", estateId] });
      qc.invalidateQueries({ queryKey: ["estate-rows"] });
      qc.invalidateQueries({ queryKey: ["estate-events", estateId] });
      toast({ title: vars.close ? "Estate closed" : "Closing record saved" });
    },
    onError: (e: Error) =>
      toast({ title: "Could not save closing", description: e.message, variant: "destructive" }),
  });
};