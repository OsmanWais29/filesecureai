import { useState } from "react";
import { Loader2, ScanText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { monthlyFromPay, useClientDocsList, useReadIncomeDocument, useSaveReadIncome, type IncomeExtraction } from "@/hooks/useFinancialsWorkbench";

const money = (n?: number | null) => (n == null ? "—" : `$${n.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`);

export const ReadIncomeDocs = ({ estateId }: { estateId?: string }) => {
  const { data: docs = [] } = useClientDocsList(estateId);
  const read = useReadIncomeDocument();
  const save = useSaveReadIncome(estateId);
  const [open, setOpen] = useState<string | null>(null);
  const [result, setResult] = useState<IncomeExtraction | null>(null);
  const [month, setMonth] = useState("");
  const [monthly, setMonthly] = useState("");

  if (!docs.length) return null;

  const run = async (id: string) => {
    setOpen(id); setResult(null);
    try {
      const r = await read.mutateAsync(id);
      setResult(r);
      const base = r.net_pay ?? r.gross_pay;
      const m = base != null ? monthlyFromPay(base, r.pay_frequency) : null;
      setMonthly(m != null ? String(m) : "");
      setMonth((r.period_end ?? r.pay_date ?? "").slice(0, 7));
    } catch (e) {
      toast({ title: "Couldn't read this document", description: (e as Error).message, variant: "destructive" });
      setOpen(null);
    }
  };

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="text-sm font-medium">Read client documents</div>
      <p className="text-xs text-muted-foreground">AI reads the figures; nothing is saved until you check and confirm them.</p>
      {docs.map((d) => (
        <div key={d.id} className="rounded-md bg-muted/40 p-2">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm">{d.title || d.file_name}</span>
            <Button size="sm" variant="outline" disabled={read.isPending} onClick={() => run(d.id)}>
              {read.isPending && open === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanText className="mr-1 h-3.5 w-3.5" />} Read
            </Button>
          </div>
          {open === d.id && result && (
            <div className="mt-2 space-y-2 text-xs">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span>Payer: <b>{result.payer ?? "—"}</b></span>
                <span>Gross: <b>{money(result.gross_pay)}</b></span>
                <span>Net: <b>{money(result.net_pay)}</b></span>
                <span>Frequency: <b>{result.pay_frequency ?? "not shown"}</b></span>
                <Badge variant={result.confidence >= 0.8 ? "secondary" : "destructive"}>{Math.round(result.confidence * 100)}% sure</Badge>
              </div>
              {result.notes && <div className="text-muted-foreground">{result.notes}</div>}
              <div className="flex flex-wrap items-end gap-2">
                <label className="space-y-1">Month<Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-8 w-40" /></label>
                <label className="space-y-1">Monthly income<Input type="number" step="0.01" value={monthly} onChange={(e) => setMonthly(e.target.value)} className="h-8 w-36" /></label>
                <Button size="sm" disabled={!month || !Number(monthly) || save.isPending} onClick={async () => {
                  try {
                    await save.mutateAsync({ documentId: d.id, month, monthlyIncome: Number(monthly), payer: result.payer });
                    toast({ title: "Saved as a draft month", description: "Add household size and expenses in Income to finish it." });
                    setOpen(null);
                  } catch (e) { toast({ title: "Couldn't save", description: (e as Error).message, variant: "destructive" }); }
                }}>Confirm & save draft</Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
