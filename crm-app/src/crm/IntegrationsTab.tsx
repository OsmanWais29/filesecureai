// Integrations: website form, booking page, calendars, email/SMS and filing export.
import { toast } from "sonner";
import { CheckCircle2, Code2, Plug } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Integration } from "./data";
import { useCRM } from "./store";
import { GOOD, Panel, Pill, copy } from "./ui";

const CATEGORIES: Integration["category"][] = ["Lead capture", "Calendar", "Email & SMS", "Filing"];

// Snippet to paste on the trustee's website so its form creates CRM leads
const EMBED = `<script src="${location.origin}/embed/lead-form.js" data-form="debt-help" async></script>\n<div id="crm-lead-form"></div>`;

export const IntegrationsTab = () => {
  const { integrations, toggleIntegration } = useCRM();

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
                  {i.connected ? <Pill className={GOOD}><CheckCircle2 className="mr-1 h-3 w-3" />Connected</Pill> : <Pill className="bg-muted text-muted-foreground">Not connected</Pill>}
                </div>
                <p className="flex-1 text-sm text-muted-foreground">{i.description}</p>
                {i.connected && i.detail && <p className="text-xs text-muted-foreground">{i.detail}</p>}
                <Button size="sm" variant={i.connected ? "outline" : "default"}
                  onClick={() => { toggleIntegration(i.id); toast.success(`${i.name} ${i.connected ? "disconnected" : "connected"}`); }}>
                  <Plug className="mr-2 h-4 w-4" />{i.connected ? "Disconnect" : "Connect"}
                </Button>
              </Card>
            ))}
          </div>
        </section>
      ))}

      <Panel icon={Code2} title="Website lead form embed code">
        <p className="mb-3 text-sm text-muted-foreground">Paste this where the form should appear on your website. New submissions show up as leads in the CRM.</p>
        <pre className="select-all overflow-x-auto rounded-md bg-muted p-3 text-xs">{EMBED}</pre>
        <Button size="sm" variant="outline" className="mt-3" onClick={() => copy(EMBED, "Embed code")}>Copy code</Button>
      </Panel>
    </div>
  );
};
