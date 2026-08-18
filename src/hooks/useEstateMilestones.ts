// Phase 2 — milestone engine. Milestones live in `estate_milestones`, but their
// due dates are recomputed from the canonical `estate_dates` register so the
// register stays the single source of truth for statutory timing.
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  MILESTONE_TEMPLATE,
  MilestoneDefinition,
  addDays,
} from "@/data/estateMilestoneTemplate";
import { logEstateEvent, useEstateDates } from "@/hooks/useEstateRecords";

const db = supabase as unknown as { from: (table: string) => any };

const requireUser = async () => {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("You must be signed in to work on estates.");
  return data.user;
};

export interface MilestoneRow {
  id: string;
  estate_id: string;
  stage: string;
  code: string;
  label: string;
  state: string;
  anchor_date_type: string | null;
  offset_days: number | null;
  due_date: string | null;
  completed_date: string | null;
  blocking: boolean;
  statutory_reference: string | null;
  notes: string | null;
  sort_order: number;
}

export interface Milestone extends MilestoneDefinition {
  id?: string;
  state: "pending" | "due" | "overdue" | "complete";
  dueDate: string | null;
  completedDate: string | null;
  anchorMissing: boolean;
}

const useMilestoneRows = (estateId?: string) =>
  useQuery({
    queryKey: ["estate-milestones", estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<MilestoneRow[]> => {
      const { data, error } = await db
        .from("estate_milestones")
        .select("*")
        .eq("estate_id", estateId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MilestoneRow[];
    },
  });

/** Merges the deterministic template with persisted state and live anchor dates. */
export const useEstateMilestones = (estateId?: string) => {
  const { data: rows = [], isLoading: loadingRows } = useMilestoneRows(estateId);
  const { data: dates = [], isLoading: loadingDates } = useEstateDates(estateId);

  const milestones = useMemo<Milestone[]>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return MILESTONE_TEMPLATE.map((def) => {
      const row = rows.find((r) => r.code === def.code);
      const anchor = def.anchorDateType
        ? dates.find((d) => d.date_type === def.anchorDateType)?.date_value ?? null
        : null;
      const dueDate =
        anchor && def.offsetDays != null ? addDays(anchor, def.offsetDays) : row?.due_date ?? null;
      const completedDate = row?.completed_date ?? null;
      const state: Milestone["state"] = completedDate
        ? "complete"
        : !dueDate
          ? "pending"
          : dueDate < today
            ? "overdue"
            : "due";
      return {
        ...def,
        id: row?.id,
        state,
        dueDate,
        completedDate,
        anchorMissing: Boolean(def.anchorDateType) && !anchor,
      };
    });
  }, [rows, dates]);

  const blockers = milestones.filter((m) => m.blocking && m.state !== "complete");
  const completed = milestones.filter((m) => m.state === "complete").length;

  return {
    milestones,
    blockers,
    completed,
    total: milestones.length,
    progress: Math.round((completed / MILESTONE_TEMPLATE.length) * 100),
    isLoading: loadingRows || loadingDates,
  };
};

/** Persists a milestone's completion / reopening. Upserts on (estate_id, code). */
export const useSaveMilestone = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      milestone: Milestone;
      completedDate?: string | null;
      notes?: string | null;
    }) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      const { milestone } = input;
      const { data, error } = await db
        .from("estate_milestones")
        .upsert(
          {
            estate_id: estateId,
            user_id: user.id,
            code: milestone.code,
            stage: milestone.stage,
            label: milestone.label,
            state: input.completedDate ? "complete" : "pending",
            anchor_date_type: milestone.anchorDateType ?? null,
            offset_days: milestone.offsetDays ?? null,
            due_date: milestone.dueDate,
            completed_date: input.completedDate ?? null,
            blocking: milestone.blocking,
            statutory_reference: milestone.statutoryReference ?? null,
            notes: input.notes ?? null,
            sort_order: MILESTONE_TEMPLATE.findIndex((m) => m.code === milestone.code),
          },
          { onConflict: "estate_id,code" }
        )
        .select()
        .single();
      if (error) throw error;
      await logEstateEvent({
        estateId,
        eventType: input.completedDate ? "estate.milestone.completed" : "estate.milestone.reopened",
        after: data,
      });
      return data as MilestoneRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate-milestones", estateId] });
      toast({ title: "Milestone updated" });
    },
    onError: (e: Error) =>
      toast({ title: "Could not update milestone", description: e.message, variant: "destructive" }),
  });
};