import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEstateTrustSettings, useSaveTrustSettings, type TrustSettings } from "@/hooks/useEstateTrustSettings";

type Form = Record<keyof Omit<TrustSettings, "estate_id">, string>;
const EMPTY: Form = { account_type: "individual_estate", account_holder: "", superintendent_approval_ref: "", superintendent_approval_date: "", fee_basis: "", approved_fee_amount: "", tariff_base: "", levy_basis: "", proposal_filed: "", proposal_approved: "", schedule_amount: "", schedule_frequency: "", schedule_first_due: "", schedule_last_due: "", pooled_coverage_confirmed_by: "", pooled_coverage_confirmed_on: "", second_approval_limit: "" };
const selectCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

export function TrustSettingsForm({ estateId, proceeding, onDone }: { estateId?: string; proceeding?: string; onDone?: () => void }) {
  const q = useEstateTrustSettings(estateId);
  const save = useSaveTrustSettings(estateId);
  const [f, setF] = useState<Form>(EMPTY);
  useEffect(() => {
    if (!q.data) return;
    const next = { ...EMPTY };
    for (const k of Object.keys(EMPTY) as (keyof Form)[]) { const v = (q.data as any)[k]; next[k] = v == null ? "" : String(v); }
    setF(next);
  }, [q.data]);
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));
  const consolidated = f.account_type !== "individual_estate";
  const isProposal = /proposal/i.test(proceeding ?? "");
  const ordinary = !isProposal && !/summary/i.test(proceeding ?? "");
  const problems: string[] = [];
  if (consolidated && (!f.superintendent_approval_ref.trim() || !f.superintendent_approval_date)) problems.push("A consolidated account needs the Superintendent's approval reference and date.");
  if (f.schedule_first_due && f.schedule_last_due && f.schedule_last_due < f.schedule_first_due) problems.push("The last payment date is before the first.");
  if (f.fee_basis && f.fee_basis !== "tariff" && !f.approved_fee_amount) problems.push("Enter the approved fee amount.");

  const submit = async () => {
    const n = (v: string) => (v.trim() === "" ? null : Number(v));
    const t = (v: string) => (v.trim() === "" ? null : v.trim());
    const b = (v: string) => (v === "" ? null : v === "yes");
    try {
      await save.mutateAsync({ before: q.data ?? null, next: {
        account_type: f.account_type as TrustSettings["account_type"], account_holder: t(f.account_holder),
        superintendent_approval_ref: consolidated ? t(f.superintendent_approval_ref) : null, superintendent_approval_date: consolidated ? t(f.superintendent_approval_date) : null,
        fee_basis: (t(f.fee_basis) as TrustSettings["fee_basis"]), approved_fee_amount: n(f.approved_fee_amount), tariff_base: n(f.tariff_base), levy_basis: n(f.levy_basis),
        proposal_filed: b(f.proposal_filed), proposal_approved: b(f.proposal_approved), schedule_amount: n(f.schedule_amount),
        schedule_frequency: (t(f.schedule_frequency) as TrustSettings["schedule_frequency"]), schedule_first_due: t(f.schedule_first_due), schedule_last_due: t(f.schedule_last_due),
        pooled_coverage_confirmed_by: consolidated ? t(f.pooled_coverage_confirmed_by) : null, pooled_coverage_confirmed_on: consolidated ? t(f.pooled_coverage_confirmed_on) : null,
        second_approval_limit: n(f.second_approval_limit),
      } });
      toast.success("Trust settings saved");
      onDone?.();
    } catch (e: any) { toast.error(e?.message ?? "Could not save trust settings"); }
  };

  const field = (k: keyof Form, label: string, type = "text", hint?: string) => <div className="space-y-1"><Label htmlFor={`ts-${k}`}>{label}</Label><Input id={`ts-${k}`} type={type} inputMode={type === "number" ? "decimal" : undefined} step={type === "number" ? "0.01" : undefined} value={f[k]} onChange={set(k)} />{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</div>;
  const yesNo = (k: keyof Form, label: string) => <div className="space-y-1"><Label htmlFor={`ts-${k}`}>{label}</Label><select id={`ts-${k}`} className={selectCls} value={f[k]} onChange={set(k)}><option value="">Not recorded</option><option value="yes">Yes</option><option value="no">No</option></select></div>;

  if (q.isLoading) return <p className="text-sm text-muted-foreground">Loading trust settings…</p>;
  return <form className="space-y-6" onSubmit={e => { e.preventDefault(); if (!problems.length) submit(); }}>
    <section className="space-y-3"><h3 className="font-semibold">Bank account</h3>
      <div className="space-y-1"><Label htmlFor="ts-account_type">Account type</Label><select id="ts-account_type" className={selectCls} value={f.account_type} onChange={set("account_type")}><option value="individual_estate">Individual estate account</option><option value="consolidated_summary">Consolidated: summary administrations</option><option value="consolidated_proposal">Consolidated: consumer proposals</option></select></div>
      {field("account_holder", "Account holder", "text", "For example: \u201cSmith Trustee Inc., in trust\u201d")}
      {consolidated && <div className="grid gap-3 sm:grid-cols-2">{field("superintendent_approval_ref", "Superintendent approval reference")}{field("superintendent_approval_date", "Approval date", "date")}{field("pooled_coverage_confirmed_by", "All estates in this account confirmed by", "text", "Needed for the bank-to-estates reconciliation")}{field("pooled_coverage_confirmed_on", "Confirmed on", "date")}</div>}
    </section>
    <section className="space-y-3"><h3 className="font-semibold">Fees and levy</h3>
      <div className="space-y-1"><Label htmlFor="ts-fee_basis">How trustee fees are set</Label><select id="ts-fee_basis" className={selectCls} value={f.fee_basis} onChange={set("fee_basis")}><option value="">Not recorded</option><option value="tariff">Tariff (Rule 128 / 129)</option><option value="court_approved">Approved by the court</option><option value="inspector_approved">Approved by inspectors</option></select>{ordinary && f.fee_basis === "tariff" && <p className="text-xs text-warning">Ordinary administrations normally need court or inspector approval.</p>}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {f.fee_basis && f.fee_basis !== "tariff" && field("approved_fee_amount", "Approved fee amount", "number")}
        {!isProposal && field("tariff_base", "Net realizations for the tariff", "number", "Receipts after secured claims and realization costs")}
        {field("levy_basis", "Payments to creditors subject to the levy", "number", "Dividends paid or to be paid")}
      </div>
    </section>
    {isProposal && <section className="space-y-3"><h3 className="font-semibold">Consumer proposal</h3>
      <div className="grid gap-3 sm:grid-cols-2">{yesNo("proposal_filed", "Proposal filed")}{yesNo("proposal_approved", "Proposal approved (deemed or by court)")}{field("schedule_amount", "Payment amount", "number")}<div className="space-y-1"><Label htmlFor="ts-schedule_frequency">How often</Label><select id="ts-schedule_frequency" className={selectCls} value={f.schedule_frequency} onChange={set("schedule_frequency")}><option value="">Not recorded</option><option value="weekly">Weekly</option><option value="biweekly">Every two weeks</option><option value="monthly">Monthly</option></select></div>{field("schedule_first_due", "First payment due", "date")}{field("schedule_last_due", "Last payment due", "date")}</div>
    </section>}
    <section className="space-y-3"><h3 className="font-semibold">Firm policy</h3>
      {field("second_approval_limit", "Second approval needed for payments over (optional)", "number", "Your firm's own rule. Directive 5R8 has no dollar limit; the licensed trustee approves every payment.")}
    </section>
    {problems.length > 0 && <ul className="space-y-1 border-l-2 border-destructive pl-3 text-sm text-destructive">{problems.map(p => <li key={p}>{p}</li>)}</ul>}
    <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onDone}>Cancel</Button><Button type="submit" disabled={save.isPending || problems.length > 0}>{save.isPending ? "Saving…" : "Save settings"}</Button></div>
  </form>;
}
