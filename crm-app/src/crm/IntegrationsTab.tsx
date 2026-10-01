// Integrations: connect the website form, booking page, calendars, email/SMS and filing export.
import { toast } from "sonner";
import { CheckCircle2, Code2, Plug } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Integration } from "./data";
import { useCRM } from "./store";
import { Pill, SectionTitle } from "./ui";

const CATEGORIES: Integration["category"][] = ["Lead capture", "Calendar", "Email & SMS", "Filing"];

// Snippet a trustee pastes into their website to capture leads into the CRM
const EMBED = `<script src="${window.location.origin}/embed/lead-form.js" data-form="debt-help" async></script>
<div id="crm-lead-form"></div>`;

export const IntegrationsTab = () => {
  const { integrations, toggleIntegration } = useCRM();

  // Connect / disconnect with a confirmation toast
  const toggle = (i: Integration) => {
    toggleIntegration(i.id);
    toast.success(i.connected ? `${i.name} disconnected` : `${i.name} connected`);
  };

  return (
    <div className="space-y-6">
      {CATEGORIES.map((cat) => (
        <section key={cat} className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cat}</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {integrations.filter((i) => i.category === cat).map((i) => (
              <Card key={i.id} className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{i.name}</p>
                  {i.connected
                    ? <Pill className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="mr-1 h-3 w-3" />Connected</Pill>
                    : <Pill className="bg-muted text-muted-foreground">Not connected</Pill>}
                </div>
                <p className="flex-1 text-sm text-muted-foreground">{i.description}</p>
                {i.connected && i.detail && <p className="text-xs text-muted-foreground">{i.detail}</p>}
                <Button variant={i.connected ? "outline" : "default"} size="sm" onClick={() => toggle(i)}>
                  <Plug className="mr-2 h-4 w-4" />{i.connected ? "Disconnect" : "Connect"}
                </Button>
              </Card>
            ))}
          </div>
        </section>
      ))}

      {/* Website embed code */}
      <Card className="p-5">
        <SectionTitle icon={Code2}>Website lead form embed code</SectionTitle>
        <p className="mb-3 text-sm text-muted-foreground">Paste this where the form should appear on your website. New submissions show up as leads in the CRM.</p>
        <pre className="select-all overflow-x-auto rounded-md bg-muted p-3 text-xs">{EMBED}</pre>
        <Button size="sm" variant="outline" className="mt-3"
          onClick={() => navigator.clipboard.writeText(EMBED).then(() => toast.success("Embed code copied"), () => toast.error("Copy failed — select the code instead"))}>
          Copy code
        </Button>
      </Card>
    </div>
  );
};
