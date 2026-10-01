// Automations: on/off rules ("when X, do Y"), email templates, and emailing everyone in a stage.
import { useState } from "react";
import { Mail, Send, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { STAGES, TEMPLATES } from "./data";
import { useCRM } from "./store";
import { EmailDialog } from "./EmailDialog";
import { Panel, SelectField } from "./ui";

const tplName = (id: string) => TEMPLATES.find((t) => t.id === id)!.name;

export const AutomationsTab = () => {
  const { automations, toggleAutomation, clients } = useCRM();
  const [stage, setStage] = useState<string>(STAGES[0]);
  const [tpl, setTpl] = useState(TEMPLATES[0].id);
  const [open, setOpen] = useState(false);
  const recipients = clients.filter((c) => c.stage === stage).map((c) => c.id);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Panel icon={Zap} title="Automation rules">
        <ul className="divide-y">
          {automations.map((a) => (
            <li key={a.id} className="flex items-start gap-4 py-3">
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium">When: {a.trigger}</p>
                <p className="text-muted-foreground">Then: {a.action}</p>
                <p className="mt-1 text-xs tabular-nums text-muted-foreground">{a.runs} runs this month</p>
              </div>
              <Switch checked={a.enabled} onCheckedChange={() => toggleAutomation(a.id)} aria-label={`${a.enabled ? "Turn off" : "Turn on"}: ${a.trigger}`} />
            </li>
          ))}
        </ul>
      </Panel>

      <div className="space-y-6">
        <Panel icon={Send} title="Email a group">
          <div className="space-y-3">
            <SelectField id="grp-stage" label="Everyone in stage" value={stage} onChange={setStage} options={STAGES} />
            <SelectField id="grp-tpl" label="Template" value={tpl} onChange={setTpl} options={TEMPLATES.map((t) => t.id)} show={tplName} />
            <Button className="w-full" disabled={!recipients.length} onClick={() => setOpen(true)}>Review email to {recipients.length} client(s)</Button>
          </div>
        </Panel>

        <Panel icon={Mail} title="Email templates">
          {TEMPLATES.map((t) => (
            <div key={t.id} className="mb-3 rounded-lg border p-3"><p className="text-sm font-medium">{t.name}</p><p className="truncate text-xs text-muted-foreground">{t.subject}</p></div>
          ))}
          <p className="text-xs text-muted-foreground">Placeholders: {"{{name}} {{trustee}} {{missingDocs}} {{date}}"}</p>
        </Panel>
      </div>

      <EmailDialog open={open} onOpenChange={setOpen} clientIds={recipients} templateId={tpl} />
    </div>
  );
};
