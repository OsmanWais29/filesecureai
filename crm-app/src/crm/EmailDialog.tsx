// Email composer: pick a template (from the backend), it fills in the client's
// details, edit, send. The backend sends via Gmail/Outlook if connected, else SES.
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Client, REQUIRED_DOCS } from "./data";
import { useCRM } from "./store";
import { SelectField } from "./ui";

// Replace {{placeholders}} with a client's details (same names the backend uses)
const fill = (text: string, c?: Client) => {
  const missing = REQUIRED_DOCS.filter((d) => !c?.docsReceived.includes(d));
  const vars: Record<string, string> = {
    name: c?.name.split(" ")[0] ?? "there",
    trustee: "Your trustee",
    missingDocs: missing.map((d) => `• ${d}`).join("\n") || "• Nothing outstanding",
    date: new Date(Date.now() + 7 * 86_400_000).toLocaleDateString("en-CA", { month: "long", day: "numeric" }),
  };
  return text.replace(/\{\{(\w+)\}\}/g, (m, k) => vars[k] ?? m);
};

export const EmailDialog = ({ open, onOpenChange, clientIds, templateKey, replyTo }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  clientIds: string[];
  templateKey?: string; // e.g. "documents", "check_in"
  replyTo?: { id: string; subject: string }; // answer inside an email thread
}) => {
  const { byId, sendEmail, templates, integrations } = useCRM();
  const to = clientIds.map((id) => byId.get(id)!).filter(Boolean);
  const [key, setKey] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const mailbox = integrations.find((i) => ["google", "microsoft"].includes(i.provider) && i.connected);

  // Load a template, previewed with the first recipient's details
  const pick = (k: string) => {
    const t = templates.find((x) => x.key === k) ?? templates[0];
    if (!t) return;
    setKey(t.key);
    setSubject(replyTo ? `Re: ${replyTo.subject}` : fill(t.subject, to[0]));
    setBody(fill(t.body, to[0]));
  };
  useEffect(() => { if (open) pick(templateKey ?? "check_in"); }, [open, templateKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async () => {
    setSending(true);
    await sendEmail(clientIds, subject, body, replyTo?.id);
    setSending(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{replyTo ? "Reply to" : "Email"} {to.length === 1 ? to[0].name : `${to.length} clients`}</DialogTitle>
          <DialogDescription>
            {to.length > 1 && "Each client gets their own copy. "}
            {mailbox ? `Sends from ${mailbox.name.split(" (")[0]}${mailbox.detail ? ` (${mailbox.detail.split(" · ")[0]})` : ""}.`
              : "Sends from the firm's email address. Connect Google or Microsoft to send from your own mailbox and see replies here."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <SelectField id="tpl" label="Template" value={key} onChange={pick} options={templates.map((t) => t.key)} show={(k) => templates.find((t) => t.key === k)?.name ?? k} />
          <p className="text-xs text-muted-foreground">To: {to.map((c) => c.email || `${c.name} (no email)`).join(", ")}</p>
          <div className="space-y-1.5"><Label htmlFor="subject">Subject</Label><Input id="subject" value={subject} disabled={!!replyTo} onChange={(e) => setSubject(e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="body">Message</Label><Textarea id="body" rows={9} value={body} onChange={(e) => setBody(e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={send} disabled={sending || !to.length || !subject.trim() || !body.trim()}>{sending ? "Sending…" : "Send"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
