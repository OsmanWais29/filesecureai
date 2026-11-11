import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRecordOsbResponse, type OsbFiling } from "@/hooks/useOsbFilings";
import { ackMatchesEstate, readAck } from "@/lib/filing/osbAck";
import { deadlineOutcome } from "@/lib/filing/status";

const pdfText = async (file: File) => {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  let out = "";
  for (let i = 1; i <= Math.min(doc.numPages, 5); i++) out += " " + (await (await doc.getPage(i)).getTextContent()).items.map((x: any) => x.str ?? "").join(" ");
  return out;
};

/** Paste or upload the OSB acknowledgement after filing elsewhere; fields are read from it, then confirmed by staff. */
export const QuickRecordOsb = ({ filing }: { filing: OsbFiling }) => {
  const record = useRecordOsbResponse();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState("");
  const [outcome, setOutcome] = useState<"acknowledged" | "accepted" | "rejected">("acknowledged");
  const [message, setMessage] = useState("");
  const [lateReason, setLateReason] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [note, setNote] = useState("");

  const apply = (raw: string) => {
    const r = readAck(raw);
    if (r.reference) setReference(r.reference);
    if (r.date) setDate(r.date);
    if (r.outcome) setOutcome(r.outcome);
    setMismatch(ackMatchesEstate(r, filing.estates?.file_number) === false);
    const missing = [!r.reference && "reference", !r.date && "date"].filter(Boolean);
    setNote(missing.length ? `Couldn't read the ${missing.join(" or ")} — type it in.` : `Read from the acknowledgement${r.estateNumber ? ` (estate ${r.estateNumber})` : ""}. Check before saving.`);
  };
  const upload = async (file?: File) => {
    if (!file) return;
    try { const raw = file.type === "application/pdf" ? await pdfText(file) : await file.text(); setText(raw.slice(0, 4000)); apply(raw); }
    catch { setNote("Couldn't read that file. Paste the acknowledgement text instead."); }
  };
  const late = outcome === "accepted" && date && deadlineOutcome(filing.deadline, date) === "late";
  const canSave = reference.trim() && date && !mismatch && (!late || lateReason.trim()) && !record.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">Record OSB reference</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Record OSB response · {filing.form_number}</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">{filing.estates?.debtor_name}{filing.estates?.file_number ? ` · ${filing.estates.file_number}` : ""}. Paste the OSB acknowledgement or upload it, and SecureFiles fills in what it can read.</p>
          <Textarea rows={3} value={text} placeholder="Paste the OSB acknowledgement email or notice" onChange={(e) => { setText(e.target.value); apply(e.target.value); }} />
          <Input type="file" accept=".pdf,.txt,.eml,text/plain,application/pdf" onChange={(e) => upload(e.target.files?.[0])} />
          {note && <p className="text-xs text-muted-foreground">{note}</p>}
          {mismatch && <p className="text-xs text-destructive">This acknowledgement is for a different estate number. Check you picked the right filing.</p>}
          <div className="grid grid-cols-2 gap-2">
            <div><Label>OSB reference</Label><Input value={reference} onChange={(e) => setReference(e.target.value)} /></div>
            <div><Label>Date received</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          </div>
          <div><Label>Outcome</Label>
            <Select value={outcome} onValueChange={(v) => setOutcome(v as typeof outcome)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="acknowledged">Acknowledged</SelectItem><SelectItem value="accepted">Accepted</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent>
            </Select>
          </div>
          {outcome === "rejected" && <div><Label>OSB message</Label><Input value={message} onChange={(e) => setMessage(e.target.value)} /></div>}
          {late && <div><Label>Why was this filed late?</Label><Input value={lateReason} onChange={(e) => setLateReason(e.target.value)} /></div>}
        </div>
        <DialogFooter>
          <Button disabled={!canSave} onClick={async () => { await record.mutateAsync({ filing, outcome, reference, receivedOn: date, message: message || undefined, lateReason: lateReason || undefined }); setOpen(false); }}>
            {record.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
