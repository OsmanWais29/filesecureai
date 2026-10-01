// Integrations: website form, booking page, calendars + mailboxes, SMS and filing export.
// Every button talks to the backend; secrets (OAuth tokens, Twilio keys) never reach the browser.
import { useState } from "react";
import { CheckCircle2, Code2, Download, Plug, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "./api";
import { Integration } from "./data";
import { useCRM } from "./store";
import { GOOD, Panel, Pill, copy } from "./ui";

const CATEGORIES: Integration["category"][] = ["Lead capture", "Calendar", "Email & SMS", "Filing"];

// Save a text as a file download
const save = (text: string, name: string) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
};

// Twilio has no OAuth: the trustee pastes their keys once (stored encrypted)
const TwilioForm = () => {
  const { connectTwilio } = useCRM();
  const [f, setF] = useState({ accountSid: "", authToken: "", from: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="space-y-2">
      <Input placeholder="Account SID (AC…)" value={f.accountSid} onChange={set("accountSid")} aria-label="Twilio account SID" />
      <Input placeholder="Auth token" type="password" value={f.authToken} onChange={set("authToken")} aria-label="Twilio auth token" />
      <Input placeholder="From number (+1…)" value={f.from} onChange={set("from")} aria-label="Twilio from number" />
      <Button size="sm" className="w-full" disabled={!f.accountSid || !f.authToken || !f.from} onClick={() => connectTwilio(f)}>
        <Plug className="mr-2 h-4 w-4" />Connect
      </Button>
    </div>
  );
};

export const IntegrationsTab = () => {
  const { integrations, available, website, connect, disconnect, syncNow } = useCRM();

  // The buttons each card needs
  const actions = (i: (typeof integrations)[number]) => {
    if (i.id === "osb") return (
      <Button size="sm" variant="outline" onClick={async () => save(await api.osbCsv(), "osb-export.csv")}>
        <Download className="mr-2 h-4 w-4" />Download CSV
      </Button>
    );
    if (i.id === "booking" && website) return (
      <Button size="sm" variant="outline" onClick={() => copy(website.bookingApi, "Booking API link")}>Copy booking API link</Button>
    );
    if (i.provider === "builtin") return null;
    if (i.connected) return (
      <div className="flex gap-2">
        {i.provider !== "twilio" && <Button size="sm" variant="outline" className="flex-1" onClick={syncNow}><RefreshCw className="mr-2 h-4 w-4" />Sync now</Button>}
        <Button size="sm" variant="outline" className="flex-1" onClick={() => disconnect(i.provider)}>Disconnect</Button>
      </div>
    );
    if (i.provider === "twilio") return <TwilioForm />;
    if (!available[i.provider]) return <p className="text-xs text-muted-foreground">Not set up on the server yet (missing OAuth keys).</p>;
    return <Button size="sm" onClick={() => connect(i.provider)}><Plug className="mr-2 h-4 w-4" />Connect</Button>;
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
                  {i.connected ? <Pill className={GOOD}><CheckCircle2 className="mr-1 h-3 w-3" />{i.provider === "builtin" ? "Ready" : "Connected"}</Pill> : <Pill className="bg-muted text-muted-foreground">Not connected</Pill>}
                </div>
                <p className="flex-1 text-sm text-muted-foreground">{i.description}</p>
                {i.connected && i.detail && i.provider !== "builtin" && <p className="text-xs text-muted-foreground">{i.detail}</p>}
                {actions(i)}
              </Card>
            ))}
          </div>
        </section>
      ))}

      {website && (
        <Panel icon={Code2} title="Website lead form embed code">
          <p className="mb-3 text-sm text-muted-foreground">Paste this where the form should appear on your website. New submissions show up as leads in the CRM.</p>
          <pre className="select-all overflow-x-auto rounded-md bg-muted p-3 text-xs">{website.embed}</pre>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => copy(website.embed, "Embed code")}>Copy code</Button>
        </Panel>
      )}
    </div>
  );
};
