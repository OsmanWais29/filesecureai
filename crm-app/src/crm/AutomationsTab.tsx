// Automations: on/off rules ("when X happens, do Y"), email templates, and bulk emails to a group.
import { useState } from "react";
import { Mail, Send, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STAGES, TEMPLATES } from "./data";
import { useCRM } from "./store";
import { EmailDialog } from "./EmailDialog";
import { SectionTitle } from "./ui";

export const AutomationsTab = () => {
  const { automations, toggleAutomation, clients } = useCRM();
  const [audience, setAudience] = useState<string>("New lead"); // stage to email
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [emailOpen, setEmailOpen] = useState(false);

  const recipients = clients.filter((c) => c.stage === audience).map((c) => c.id);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Rules */}
      <Card className="p-5">
        <SectionTitle icon={Zap}>Automation rules</SectionTitle>
        <ul className="divide-y">
          {automations.map((a) => (
            <li key={a.id} className="flex items-start gap-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">When: {a.trigger}</p>
                <p className="text-sm text-muted-foreground">Then: {a.action}</p>
                <p className="mt-1 text-xs text-muted-foreground tabular-nums">{a.runs} runs this month</p>
              </div>
              <Switch checked={a.enabled} onCheckedChange={() => toggleAutomation(a.id)} aria-label={`Turn ${a.enabled ? "off" : "on"}: ${a.trigger}`} />
            </li>
          ))}
        </ul>
      </Card>

      <div className="space-y-6">
        {/* Bulk email to everyone in a stage */}
        <Card className="space-y-3 p-5">
          <SectionTitle icon={Send}>Email a group</SectionTitle>
          <div className="space-y-1.5">
            <Label htmlFor="aud">Everyone in stage</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger id="aud"><SelectValue /></SelectTrigger>
              <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="grp-tpl">Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger id="grp-tpl"><SelectValue /></SelectTrigger>
              <SelectContent>{TEMPLATES.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button className="w-full" disabled={!recipients.length} onClick={() => setEmailOpen(true)}>
            Review email to {recipients.length} client(s)
          </Button>
        </Card>

        {/* Templates */}
        <Card className="p-5">
          <SectionTitle icon={Mail}>Email templates</SectionTitle>
          <ul className="space-y-3">
            {TEMPLATES.map((t) => (
              <li key={t.id} className="rounded-lg border p-3">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="truncate text-xs text-muted-foreground">{t.subject}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Placeholders: {"{{name}}"}, {"{{trustee}}"}, {"{{missingDocs}}"}, {"{{date}}"}</p>
        </Card>
      </div>

      <EmailDialog open={emailOpen} onOpenChange={setEmailOpen} clientIds={recipients} templateId={templateId} />
    </div>
  );
};
