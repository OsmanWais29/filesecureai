// Manual trust postings that work without Finix or Inverite. Every posting is a
// balanced, insert-only ledger entry validated by the database trigger, needs a
// signed-in trustee's explicit approval, and is written to the estate audit trail.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logEstateEvent } from "@/hooks/useEstateRecords";

const db = supabase as any;
const cents = (n: number) => Math.round(n * 100) / 100;
const BANK = "10000 · Trust Bank";

async function requireUser() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("You must be signed in as a trustee to post.");
  return data.user;
}

async function postReceipt(o: { estateId: string; userId: string; date: string; amount: number; payer: string; method: string; reference: string; sourceType: string; memo: string; approvedBy: string }) {
  const amount = cents(o.amount);
  if (!(amount > 0)) throw new Error("Each amount must be positive.");
  const { data: receipt, error } = await db.from("estate_receipts").insert({
    estate_id: o.estateId, user_id: o.userId, receipt_date: o.date, deposit_date: o.date, received_from: o.payer,
    payment_method: o.method, amount, reference: o.reference, memo: `${o.memo} · approved by ${o.approvedBy}`, posted: true,
  }).select().single();
  if (error) throw error;
  const { data: entry, error: le } = await db.from("estate_ledger_entries").insert({
    estate_id: o.estateId, user_id: o.userId, gl_date: o.date, memo: o.payer, source_type: o.sourceType, source_id: receipt.id,
    lines: [{ account: BANK, debit: amount, credit: 0 }, { account: "Estate receipts", debit: 0, credit: amount }],
    total_debit: amount, total_credit: amount,
  }).select("id").single();
  if (le) throw new Error(`Receipt recorded but ledger posting failed: ${le.message}. Do not repost; review the receipt.`);
  await logEstateEvent({ estateId: o.estateId, eventType: `estate.trust.${o.sourceType}.posted`, after: { receipt, ledger_entry_id: entry.id, approved_by: o.approvedBy }, source: "manual" });
  return receipt;
}

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => ["estate_ledger_entries", "estate_receipts", "estate_payment_schedules", "estate_events"].forEach(k => qc.invalidateQueries({ queryKey: [k] }));
};
const fail = (title: string) => (e: Error) => toast({ title, description: e.message, variant: "destructive" });

/** Split one bank deposit across estates. Refuses unless the split is exact. */
export function usePostDeposit() {
  const done = useInvalidate();
  return useMutation({
    mutationFn: async (i: { date: string; deposit: number; reference: string; lines: { estateId: string; name: string; amount: number }[] }) => {
      const user = await requireUser();
      const split = cents(i.lines.reduce((s, l) => s + l.amount, 0));
      if (cents(i.deposit) !== split) throw new Error("The split must equal the deposit exactly.");
      const who = user.email ?? user.id;
      for (const l of i.lines) await postReceipt({ estateId: l.estateId, userId: user.id, date: i.date, amount: l.amount, payer: `Deposit ${i.reference || i.date}`, method: "deposit", reference: i.reference, sourceType: "deposit", memo: `Split of ${i.deposit.toFixed(2)} deposit`, approvedBy: who });
      return i.lines.length;
    },
    onSuccess: n => { done(); toast({ title: "Deposit posted", description: `${n} estate ledger${n > 1 ? "s" : ""} updated.` }); },
    onError: fail("Deposit not posted"),
  });
}

/** Imported rows matched to an estate by estate number. Rows already posted (same import reference) are skipped. */
export function usePostImport() {
  const done = useInvalidate();
  return useMutation({
    mutationFn: async (i: { rows: { date: string; amount: number; payer: string; estateNumber: string; reference: string }[]; fileType: string }) => {
      const user = await requireUser();
      const who = user.email ?? user.id;
      let posted = 0, skipped = 0;
      for (const r of i.rows) {
        const { data: est } = await db.from("estates").select("id").eq("file_number", r.estateNumber).maybeSingle();
        if (!est) { skipped++; continue; }
        const { data: dup } = await db.from("estate_receipts").select("id").eq("estate_id", est.id).eq("reference", r.reference).limit(1);
        if (dup?.length) { skipped++; continue; }
        await postReceipt({ estateId: est.id, userId: user.id, date: r.date, amount: r.amount, payer: r.payer || "Imported receipt", method: i.fileType === "pad" ? "pad" : "import", reference: r.reference, sourceType: i.fileType === "pad" ? "pad_receipt" : "import", memo: `Imported ${i.fileType}`, approvedBy: who });
        posted++;
      }
      return { posted, skipped };
    },
    onSuccess: r => { done(); toast({ title: "Import posted", description: `${r.posted} posted, ${r.skipped} skipped (no estate access, no match, or already imported).` }); },
    onError: fail("Import stopped"),
  });
}

/** Reverse a receipt with a new linked entry. The original is never changed. */
export function usePostReversal(estateId?: string) {
  const done = useInvalidate();
  return useMutation({
    mutationFn: async (i: { entryId: string; amount: number; payer: string; reason: string; date: string }) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      const amount = cents(i.amount);
      const { data: entry, error } = await db.from("estate_ledger_entries").insert({
        estate_id: estateId, user_id: user.id, gl_date: i.date, memo: `Return (${i.reason}): ${i.payer}`, source_type: "reversal", source_id: i.entryId,
        lines: [{ account: "Returned payments", debit: amount, credit: 0 }, { account: BANK, debit: 0, credit: amount }],
        total_debit: amount, total_credit: amount,
      }).select().single();
      if (error) throw error;
      await logEstateEvent({ estateId, eventType: "estate.trust.reversal.posted", after: { ...entry, reason: i.reason, approved_by: user.email ?? user.id }, reason: i.reason, source: "manual" });
    },
    onSuccess: () => { done(); toast({ title: "Reversal posted", description: "Linked to the original receipt." }); },
    onError: fail("Reversal not posted"),
  });
}

/** Save a signed PAD agreement collected outside Finix. */
export function useSavePadAgreement(estateId?: string) {
  const done = useInvalidate();
  return useMutation({
    mutationFn: async (i: { amount: number; firstDebit: string; fileName: string; reference: string; confirmed: string[] }) => {
      if (!estateId) throw new Error("No estate selected.");
      const user = await requireUser();
      const { data, error } = await db.from("estate_payment_schedules").insert({
        estate_id: estateId, user_id: user.id, schedule_type: "pad", payment_category: "pad_agreement", period_type: "monthly",
        start_date: i.firstDebit, first_debit_date: i.firstDebit, amount_per_payment: cents(i.amount), pad_enabled: true,
        mandate_reference: i.reference || null, active: true,
        comments: `Signed agreement: ${i.fileName}. Confirmed: ${i.confirmed.join(", ")}. Recorded by ${user.email ?? user.id}.`,
      }).select().single();
      if (error) throw error;
      await logEstateEvent({ estateId, eventType: "estate.trust.pad_agreement.saved", after: data, source: "manual" });
    },
    onSuccess: () => { done(); toast({ title: "PAD agreement saved" }); },
    onError: fail("Agreement not saved"),
  });
}
