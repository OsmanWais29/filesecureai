// Phase 8 — form catalogue, parameter capture, generation and filing state.
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { RecordValues } from "@/components/estate/forms/RecordForm";
import { logEstateEvent } from "@/hooks/useEstateRecords";
import { useEstateCompliance } from "@/hooks/useEstateCompliance";

const db = supabase as unknown as { from: (table: string) => any };

export interface FormCatalogueEntry {
  number: string;
  title: string;
  /** Compliance rule ids that must pass before the form can be generated. */
  requires: string[];
}

export const FORM_CATALOGUE: FormCatalogueEntry[] = [
  { number: "Form 1", title: "Assignment for the General Benefit of Creditors", requires: ["identity"] },
  { number: "Form 31", title: "Proof of Claim", requires: ["creditors"] },
  { number: "Form 47", title: "Consumer Proposal", requires: ["identity", "dates"] },
  { number: "Form 65", title: "Monthly Income and Expense Statement", requires: ["income"] },
  { number: "Form 66", title: "Statement of Affairs", requires: ["identity", "assets", "creditors"] },
  { number: "Form 67", title: "Notice to Creditors", requires: ["creditors"] },
  { number: "Form 78", title: "Statement of Receipts and Disbursements", requires: ["reconciliation"] },
  { number: "Form 82", title: "Trustee's Report on Bankrupt's Application for Discharge", requires: ["counselling", "income"] },
];

export interface FormInstanceRow {
  id: string;
  estate_id: string;
  form_number: string;
  title: string | null;
  status: string;
  validation_state: string;
  parameters: Record<string, unknown>;
  signing_date: string | null;
  generated_at: string | null;
  filed_at: string | null;
}

export interface FormCatalogueItem extends FormCatalogueEntry {
  instance?: FormInstanceRow;
  status: string;
  validation: "Passed" | "Blocked";
  blockers: string[];
}

export const useFormInstances = (estateId?: string) =>
  useQuery({
    queryKey: ["estate_form_instances", estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<FormInstanceRow[]> => {
      const { data, error } = await db
        .from("estate_form_instances")
        .select("*")
        .eq("estate_id", estateId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as FormInstanceRow[];
    },
  });

/** Merges the static catalogue with persisted instances and live compliance gates. */
export const useEstateForms = (estateId?: string) => {
  const { data: instances = [], isLoading } = useFormInstances(estateId);
  const { rules } = useEstateCompliance(estateId);

  const items = useMemo<FormCatalogueItem[]>(() => {
    const failing = new Set(rules.filter((r) => r.state !== "pass").map((r) => r.id));
    return FORM_CATALOGUE.map((entry) => {
      const instance = instances.find((i) => i.form_number === entry.number);
      const blockers = entry.requires
        .filter((id) => failing.has(id))
        .map((id) => rules.find((r) => r.id === id)?.rule ?? id);
      return {
        ...entry,
        instance,
        status: instance?.filed_at
          ? "Filed"
          : instance?.generated_at
            ? "Generated"
            : instance
              ? "Draft"
              : "Not started",
        validation: blockers.length ? "Blocked" : "Passed",
        blockers,
      };
    });
  }, [instances, rules]);

  return { items, isLoading };
};

export const formToValues = (item: FormCatalogueItem): RecordValues => ({
  formNumber: item.number,
  formName: item.title,
  eFile: true,
  signingDate: item.instance?.signing_date ?? "",
  ...((item.instance?.parameters as RecordValues) ?? {}),
});

export const useSaveFormInstance = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      item,
      values,
      generate,
      file,
    }: {
      item: FormCatalogueItem;
      values: RecordValues;
      generate?: boolean;
      file?: boolean;
    }) => {
      if (!estateId) throw new Error("No estate selected.");
      if (generate && item.blockers.length) {
        throw new Error(`Blocked by: ${item.blockers.join(", ")}`);
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("You must be signed in to work on estates.");
      const now = new Date().toISOString();
      const row = {
        form_number: item.number,
        title: item.title,
        parameters: values as Record<string, unknown>,
        signing_date: values.signingDate ? String(values.signingDate) : null,
        validation_state: item.blockers.length ? "blocked" : "passed",
        status: file ? "filed" : generate ? "generated" : "draft",
        generated_at: generate || file ? (item.instance?.generated_at ?? now) : item.instance?.generated_at ?? null,
        filed_at: file ? now : item.instance?.filed_at ?? null,
      };
      const query = item.instance
        ? db.from("estate_form_instances").update(row).eq("id", item.instance.id)
        : db
            .from("estate_form_instances")
            .insert({ ...row, estate_id: estateId, user_id: auth.user.id });
      const { data, error } = await query.select().single();
      if (error) throw error;
      await logEstateEvent({
        estateId,
        eventType: `estate.form.${file ? "filed" : generate ? "generated" : "saved"}`,
        after: { form: item.number, status: row.status },
      });
      return data as FormInstanceRow;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["estate_form_instances", estateId] });
      qc.invalidateQueries({ queryKey: ["estate-events", estateId] });
      toast({
        title: vars.file ? "Form filed" : vars.generate ? "Form generated" : "Parameters saved",
      });
    },
    onError: (e: Error) =>
      toast({ title: "Form action failed", description: e.message, variant: "destructive" }),
  });
};