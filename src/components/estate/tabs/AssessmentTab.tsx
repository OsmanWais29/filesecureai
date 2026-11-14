import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecordForm, Register, type RecordValues, type SectionSpec, useRecordValues } from "@/components/estate/forms/RecordForm";
import { assessmentErrors } from "@/lib/estateJourney";
import { toast } from "sonner";

const sections: SectionSpec[] = [
  { title: "Assessment", fields: [{ key: "assessed_on", label: "Assessment date", type: "date" }, { key: "assessor", label: "Assessor" }, { key: "supervising_lit", label: "Supervising LIT" }, { key: "options_explained", label: "Options explained to the debtor", type: "textarea", span: 3 }, { key: "recommendation", label: "Recommendation and reasons", type: "textarea", span: 3 }] },
  { title: "Evidence and approval", fields: [{ key: "evidence_reference", label: "Assessment evidence reference", span: 3 }, { key: "id_verified", label: "Identity verified", type: "checkbox" }, { key: "prior_insolvency_checked", label: "Prior insolvency checked", type: "checkbox" }, { key: "debtor_acknowledged", label: "Debtor acknowledged the options", type: "checkbox" }, { key: "signed_off", label: "I approve this assessment as the LIT", type: "checkbox", span: 3 }] },
];
export function AssessmentTab({ estateId }: { estateId?: string }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const { values, setValues, onChange } = useRecordValues({});
  const records = useQuery({ queryKey: ["estate-assessments", estateId], enabled: !!estateId, queryFn: async () => {
    if (!estateId) return [];
    const { data, error } = await supabase.from("estate_assessments").select("*").eq("estate_id", estateId).order("created_at", { ascending: false });
    if (error) throw error; return data;
  } });
  const save = useMutation({ mutationFn: async (v: RecordValues) => {
    if (!estateId) throw new Error("Select an estate.");
    const errors = assessmentErrors(v); if (errors.length) throw new Error(errors.join(" "));
    const { data: auth } = await supabase.auth.getUser(); if (!auth.user) throw new Error("Sign in to record an assessment.");
    const { error } = await supabase.from("estate_assessments").insert({ estate_id: estateId, user_id: auth.user.id, assessed_on: String(v.assessed_on), assessor: String(v.assessor), options_explained: String(v.options_explained), recommendation: String(v.recommendation), evidence_reference: String(v.evidence_reference), supervising_lit: String(v.supervising_lit), id_verified: !!v.id_verified, prior_insolvency_checked: !!v.prior_insolvency_checked, debtor_acknowledged: !!v.debtor_acknowledged, signed_off: !!v.signed_off });
    if (error) throw error;
  }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["estate-assessments", estateId] }); qc.invalidateQueries({ queryKey: ["estate-events", estateId] }); setEditing(false); setValues({}); toast.success("Assessment recorded"); }, onError: (e: Error) => toast.error(e.message) });
  return <Register title="Assessment record" action={<Button disabled={save.isPending} onClick={() => { setValues({}); setEditing(true); }}>Record assessment</Button>}>
    {records.isError && <p className="text-destructive">Could not load assessment records. Please retry.</p>}
    {records.isLoading && <p className="text-muted-foreground">Loading assessments…</p>}
    {!records.isLoading && !records.isError && !records.data?.length && <p className="py-6 text-muted-foreground">No assessment recorded.</p>}
    {editing && <div className="space-y-3"><RecordForm card={false} sections={sections} values={values} onChange={onChange} />{assessmentErrors(values).map(e => <p key={e} className="text-sm text-destructive">{e}</p>)}<Button disabled={save.isPending || assessmentErrors(values).length > 0} onClick={() => save.mutate(values)}>{save.isPending ? "Saving…" : "Save assessment"}</Button><Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button></div>}
    <div className="space-y-3">{records.data?.map(r => <div key={r.id} className="border-b py-4"><div className="flex flex-wrap gap-3"><strong>{r.assessed_on} · {r.assessor}</strong><Badge variant={r.signed_off ? "secondary" : "outline"}>{r.signed_off ? "LIT signed off" : "Awaiting sign-off"}</Badge></div><p className="mt-2 whitespace-pre-wrap">{r.recommendation}</p><details className="mt-2 text-sm"><summary>Assessment evidence</summary><p className="whitespace-pre-wrap">{r.options_explained}</p><p>Supervising LIT: {r.supervising_lit} · Evidence: {r.evidence_reference}</p></details></div>)}</div>
  </Register>;
}