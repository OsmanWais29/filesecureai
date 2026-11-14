import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Register } from "@/components/estate/forms/RecordForm";
import { useEstateCreditors, type EstateCreditorRow } from "@/hooks/useEstateCreditors";
import { dayOneNotice, noticeStatus, validateDecision, type ClaimDecision, type NoticeKind } from "@/lib/creditors/claimsRegister";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
const money = (n: number) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);

const useDecisions = (estateId?: string) => useQuery({
  queryKey: ["claim-decisions", estateId], enabled: !!estateId,
  queryFn: async () => {
    const { data, error } = await db.from("estate_claim_decisions").select("*").eq("estate_id", estateId).order("decided_at", { ascending: false });
    if (error) throw error; return data as Array<{ id: string; creditor_id: string; decision: ClaimDecision; admitted_amount: number; reason: string | null; decided_at: string; notice_sent_date: string | null }>;
  },
});
const useNotices = (estateId?: string) => useQuery({
  queryKey: ["statutory-notices", estateId], enabled: !!estateId,
  queryFn: async () => {
    const { data, error } = await db.from("estate_statutory_notices").select("*").eq("estate_id", estateId).order("sent_date", { ascending: false });
    if (error) throw error; return data as Array<{ id: string; notice_kind: NoticeKind; creditor_id: string | null; due_date: string | null; sent_date: string; method: string; recipients_count: number; proof_reference: string; late_reason: string | null }>;
  },
});

async function logEvent(estateId: string, type: string, reason: string, after: Record<string, unknown>) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await db.from("estate_events").insert({ estate_id: estateId, user_id: data.user.id, actor: data.user.email, event_type: type, reason, after_state: after, source: "claims_register" });
}

const DONE_LABEL: Record<ClaimDecision, string> = { admitted: "Admitted", partially_disallowed: "Partly disallowed", disallowed: "Disallowed" };
const DECISION_LABEL: Record<ClaimDecision, string> = { admitted: "Admit", partially_disallowed: "Partly disallow", disallowed: "Disallow" };

function DecisionPanel({ estateId, creditor, onClose }: { estateId: string; creditor: EstateCreditorRow; onClose: () => void }) {
  const qc = useQueryClient();
  const [decision, setDecision] = useState<ClaimDecision>("admitted");
  const [amount, setAmount] = useState(String(creditor.filed_amount ?? 0));
  const [reason, setReason] = useState("");
  const [noticeDate, setNoticeDate] = useState("");
  const [method, setMethod] = useState("Email");
  const [proof, setProof] = useState("");
  const [approve, setApprove] = useState(false);
  const admitted = decision === "disallowed" ? 0 : Number(amount) || 0;
  const errors = validateDecision({ decision, filedAmount: Number(creditor.filed_amount) || 0, admittedAmount: admitted, reason });
  const needsNotice = decision !== "admitted";
  if (needsNotice && (!noticeDate || !proof.trim())) errors.push("Record the s.135 notice date and proof of mailing.");

  const save = useMutation({
    mutationFn: async () => {
      const filed = Number(creditor.filed_amount) || 0;
      const { error } = await db.from("estate_claim_decisions").insert({
        estate_id: estateId, creditor_id: creditor.id, decision, admitted_amount: admitted,
        disallowed_amount: Math.max(0, filed - admitted), reason: reason || null,
        notice_sent_date: needsNotice ? noticeDate : null, notice_method: needsNotice ? method : null,
      });
      if (error) throw error;
      if (needsNotice) {
        const { error: e2 } = await db.from("estate_statutory_notices").insert({
          estate_id: estateId, notice_kind: "s135_disallowance", creditor_id: creditor.id, sent_date: noticeDate, method, recipients_count: 1, proof_reference: proof,
        });
        if (e2) throw e2;
      }
      await logEvent(estateId, "claim_decision", `${DONE_LABEL[decision]} claim — ${creditor.legal_name}`, { creditor_id: creditor.id, decision, admitted_amount: admitted, reason });
    },
    onSuccess: () => { ["claim-decisions", "statutory-notices", "estate_creditors"].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); toast.success("Decision saved"); onClose(); },
    onError: (e: Error) => toast.error(e.message || "Could not save. Check you are assigned to this estate."),
  });

  return (
    <div className="space-y-4 pt-4 text-sm">
      <p>Claimed: <strong>{money(creditor.filed_amount)}</strong> · {creditor.claim_class ?? "Class not set"}</p>
      <div className="flex gap-2">
        {(Object.keys(DECISION_LABEL) as ClaimDecision[]).map((d) => (
          <Button key={d} size="sm" variant={decision === d ? "default" : "outline"} onClick={() => setDecision(d)}>{DECISION_LABEL[d]}</Button>
        ))}
      </div>
      {decision !== "disallowed" && (<div><Label>Admitted amount</Label><Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>)}
      {needsNotice && (<>
        <div><Label>Reason for disallowance</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Notice sent on</Label><Input type="date" value={noticeDate} onChange={(e) => setNoticeDate(e.target.value)} /></div>
          <div><Label>Sent by</Label><Input value={method} onChange={(e) => setMethod(e.target.value)} /></div>
        </div>
        <div><Label>Proof of mailing (tracking no. or email reference)</Label><Input value={proof} onChange={(e) => setProof(e.target.value)} /></div>
      </>)}
      {errors.length > 0 && <ul className="list-disc pl-5 text-destructive">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
      <label className="flex items-center gap-2"><Checkbox checked={approve} onCheckedChange={(v) => setApprove(!!v)} /> I make this decision as trustee</label>
      <p className="text-xs text-muted-foreground">Decisions are permanent. To change one, record a new decision.</p>
      <Button disabled={errors.length > 0 || !approve || save.isPending} onClick={() => save.mutate()}>Save decision</Button>
    </div>
  );
}

export function ClaimsRegister({ estateId }: { estateId?: string }) {
  const { data: creditors = [] } = useEstateCreditors(estateId);
  const { data: decisions = [] } = useDecisions(estateId);
  const [open, setOpen] = useState<EstateCreditorRow | null>(null);
  const filed = creditors.filter((c) => c.poc_filed);
  const latest = (id: string) => decisions.find((d) => d.creditor_id === id);
  const pending = filed.filter((c) => !latest(c.id)).length;
  return (
    <Register title="Claims register" description={`${filed.length} proofs of claim · ${pending} waiting for your decision. Every decision is kept permanently.`}>
      <div className="space-y-2 text-sm">
        {filed.length === 0 && <p className="rounded-md border border-dashed p-6 text-center text-muted-foreground">No proofs of claim received yet. Tick "Proof of claim filed" on a creditor to add it here.</p>}
        {filed.map((c) => { const d = latest(c.id); return (
          <div key={c.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-2 rounded-md border p-2">
            <span className="font-medium">{c.legal_name}<span className="block text-xs text-muted-foreground">Received {c.received_date ?? "—"}</span></span>
            <span>{money(c.filed_amount)}</span>
            <span>{d ? money(d.admitted_amount) : "—"}</span>
            <Badge variant={d ? (d.decision === "admitted" ? "secondary" : "destructive") : "outline"} className="w-fit">{d ? DONE_LABEL[d.decision] : "Needs decision"}</Badge>
            <Button size="sm" variant={d ? "ghost" : "default"} onClick={() => setOpen(c)}>{d ? "Revise" : "Decide"}</Button>
          </div>); })}
      </div>
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent><SheetHeader><SheetTitle>Decide claim — {open?.legal_name}</SheetTitle></SheetHeader>
          {open && estateId && <DecisionPanel estateId={estateId} creditor={open} onClose={() => setOpen(null)} />}
        </SheetContent>
      </Sheet>
    </Register>
  );
}

const STATUS: Record<string, { label: string; variant: "secondary" | "destructive" | "outline" | "default" }> = {
  sent: { label: "Sent on time", variant: "secondary" }, sent_late: { label: "Sent late", variant: "destructive" },
  overdue: { label: "Overdue", variant: "destructive" }, due: { label: "Due", variant: "default" }, not_checked: { label: "Not checked", variant: "outline" },
};

export function DayOneNotices({ estateId }: { estateId?: string }) {
  const qc = useQueryClient();
  const { data: creditors = [] } = useEstateCreditors(estateId);
  const { data: notices = [] } = useNotices(estateId);
  const { data: estate } = useQuery({ queryKey: ["estate-dates-basic", estateId], enabled: !!estateId, queryFn: async () => {
    const { data, error } = await db.from("estates").select("estate_type, insolvency_date, appointment_date").eq("id", estateId).maybeSingle(); if (error) throw error; return data;
  } });
  const rule = estate ? dayOneNotice(estate.estate_type, estate.insolvency_date, estate.appointment_date) : null;
  const sent = rule ? notices.find((n) => n.notice_kind === rule.kind) : undefined;
  const status = rule ? noticeStatus(rule.dueDate, sent?.sent_date ?? null, today()) : "not_checked";
  const [form, setForm] = useState({ sent: today(), method: "Email and mail", proof: "", late: "" });
  const late = !!rule?.dueDate && form.sent > rule.dueDate;
  const save = useMutation({
    mutationFn: async () => {
      const { error } = await db.from("estate_statutory_notices").insert({ estate_id: estateId, notice_kind: rule!.kind, due_date: rule!.dueDate, sent_date: form.sent, method: form.method, recipients_count: creditors.length, proof_reference: form.proof, late_reason: late ? form.late : null });
      if (error) throw error;
      await logEvent(estateId!, "statutory_notice", `${rule!.label} sent`, { ...form, recipients: creditors.length, due_date: rule!.dueDate });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["statutory-notices"] }); toast.success("Notice recorded"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Register title="Day-one notices" description="The first statutory notice after filing, with proof of mailing.">
      {!rule ? <p className="text-sm text-muted-foreground">Set the estate type (bankruptcy or proposal) to see which notice applies.</p> : (
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
            <div><p className="font-medium">{rule.label}</p><p className="text-xs text-muted-foreground">{rule.rule}</p>
              <p className="mt-1">Due: <strong>{rule.dueDate ?? "—"}</strong>{rule.blocker && <span className="block text-destructive">{rule.blocker}</span>}</p></div>
            <Badge variant={STATUS[status].variant}>{STATUS[status].label}</Badge>
          </div>
          {sent ? <p>Sent {sent.sent_date} by {sent.method} to {sent.recipients_count} creditors · proof: {sent.proof_reference}{sent.late_reason && ` · late reason: ${sent.late_reason}`}</p> : (
            <div className="grid gap-2 sm:grid-cols-3">
              <div><Label>Sent on</Label><Input type="date" value={form.sent} onChange={(e) => setForm({ ...form, sent: e.target.value })} /></div>
              <div><Label>Sent by</Label><Input value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} /></div>
              <div><Label>Proof of mailing</Label><Input value={form.proof} onChange={(e) => setForm({ ...form, proof: e.target.value })} /></div>
              {late && <div className="sm:col-span-3"><Label>Reason it was late (recorded now)</Label><Input value={form.late} onChange={(e) => setForm({ ...form, late: e.target.value })} /></div>}
              <p className="text-xs text-muted-foreground sm:col-span-3">Goes to all {creditors.length} creditors on the list.</p>
              <Button className="w-fit" disabled={!form.proof.trim() || creditors.length === 0 || (late && form.late.trim().length < 5) || save.isPending} onClick={() => save.mutate()}>Record notice sent</Button>
            </div>)}
          {notices.filter((n) => n.notice_kind === "s135_disallowance").length > 0 && (
            <div><p className="font-medium">Disallowance notices (s.135)</p>
              {notices.filter((n) => n.notice_kind === "s135_disallowance").map((n) => (
                <p key={n.id} className="text-xs">{n.sent_date} · {creditors.find((c) => c.id === n.creditor_id)?.legal_name ?? "Creditor"} · {n.method} · {n.proof_reference}</p>))}
            </div>)}
        </div>)}
    </Register>
  );
}
