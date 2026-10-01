// Email composer: pick a template, it fills in the client's details, edit, send.
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Client, REQUIRED_DOCS, TEMPLATES } from "./data";
import { useCRM } from "./store";
import { SelectField } from "./ui";

// Replace {{placeholders}} with a client's details
const fill = (text: string, c?: Client) => {
  const vars: Record<string, string> = {
    name: c?.name.split(" ")[0] ?? "there",
    trustee: c?.assignedTo ?? "Your trustee",
    missingDocs: REQUIRED_DOCS.filter((d) => !c?.docsReceived.includes(d)).map((d) => `• ${d}`).join("\n") || "• Nothing outstanding",
    date: new Date(Date.now() + 7 * 86_400_000).toLocaleDateString("en-CA", { month: "long", day: "numeric" }),
  };
  return text.replace(/\{\{(\w+)\}\}/g, (m, k) => vars[k] ?? m);
};

export const EmailDialog = ({ open, onOpenChange, clientIds, templateId }: {
  open: boolean; onOpenChange: (o: boolean) => void; clientIds: string[]; templateId?: string;
}) => {
  const { byId, sendEmail, integrations } = useCRM();
  const to = clientIds.map((id) => byId.get(id)!).filter(Boolean);
  const [tpl, setTpl] = useState(TEMPLATES[0].id);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const mailbox = integrations.some((i) => ["Gmail", "Microsoft Outlook"].includes(i.name) && i.connected);

  // Load a template, previewed with the first recipient's details
  const pick = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id) ?? TEMPLATES[0];
    setTpl(t.id); setSubject(fill(t.subject, to[0])); setBody(fill(t.body, to[0]));
  };
  useEffect(() => { if (open) pick(templateId ?? TEMPLATES[0].id); }, [open, templateId]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = () => {
    sendEmail(clientIds, subject);
    toast.success(mailbox ? `Sent to ${to.length} client(s)` : `Logged on ${to.length} client timeline(s)`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Email {to.length === 1 ? to[0].name : `${to.length} clients`}</DialogTitle>
          <DialogDescription>
            {to.length > 1 && "Each client gets their own copy with their details filled in. "}
            {!mailbox && "No mailbox connected yet, so the email is logged on the client timeline. Connect Gmail or Outlook in Integrations to send it."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <SelectField id="tpl" label="Template" value={tpl} onChange={pick} options={TEMPLATES.map((t) => t.id)} show={(id) => TEMPLATES.find((t) => t.id === id)!.name} />
          <p className="text-xs text-muted-foreground">To: {to.map((c) => c.email).join(", ")}</p>
          <div className="space-y-1.5"><Label htmlFor="subject">Subject</Label><Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="body">Message</Label><Textarea id="body" rows={9} value={body} onChange={(e) => setBody(e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={send} disabled={!to.length || !subject.trim()}>{mailbox ? "Send" : "Log email"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
