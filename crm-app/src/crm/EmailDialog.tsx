// Email composer: pick a template, it fills in the client's details, edit, send.
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client, REQUIRED_DOCS, TEMPLATES, Template } from "./data";
import { useCRM } from "./store";

// Replace {{placeholders}} with a client's details
export const fill = (text: string, c?: Client) => {
  const missing = REQUIRED_DOCS.filter((d) => !c?.docsReceived.includes(d)).map((d) => `• ${d}`).join("\n");
  const due = new Date(Date.now() + 7 * 86_400_000).toLocaleDateString("en-CA", { month: "long", day: "numeric" });
  return text
    .replaceAll("{{name}}", c?.name.split(" ")[0] ?? "there")
    .replaceAll("{{trustee}}", c?.assignedTo ?? "Your trustee")
    .replaceAll("{{missingDocs}}", missing || "• Nothing outstanding")
    .replaceAll("{{date}}", due);
};

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  clientIds: string[]; // who receives it
  templateId?: string; // pre-selected template
}

export const EmailDialog = ({ open, onOpenChange, clientIds, templateId }: Props) => {
  const { clients, sendEmail, integrations } = useCRM();
  const to = clients.filter((c) => clientIds.includes(c.id));
  const [tpl, setTpl] = useState<Template>(TEMPLATES[0]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // Is an email account connected?
  const mailbox = integrations.find((i) => (i.name === "Gmail" || i.name === "Microsoft Outlook") && i.connected);

  // Load a template (preview uses the first recipient's details)
  const pick = (t: Template) => { setTpl(t); setSubject(fill(t.subject, to[0])); setBody(fill(t.body, to[0])); };

  // Reset whenever the dialog opens
  useEffect(() => {
    if (open) pick(TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, templateId]);

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
            {to.length > 1 ? "Each client gets their own copy with their details filled in. " : ""}
            {!mailbox && "No mailbox connected yet: the email is logged on the client timeline. Connect Gmail or Outlook in Integrations to send it."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Template */}
          <div className="space-y-1.5">
            <Label htmlFor="tpl">Template</Label>
            <Select value={tpl.id} onValueChange={(v) => pick(TEMPLATES.find((t) => t.id === v)!)}>
              <SelectTrigger id="tpl"><SelectValue /></SelectTrigger>
              <SelectContent>{TEMPLATES.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {/* Recipients */}
          <p className="text-xs text-muted-foreground">To: {to.map((c) => c.email).join(", ")}</p>
          {/* Subject + body (editable) */}
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body">Message</Label>
            <Textarea id="body" rows={9} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={send} disabled={!to.length || !subject.trim()}>{mailbox ? "Send" : "Log email"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
