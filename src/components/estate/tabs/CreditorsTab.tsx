import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RecordDrawer, Register } from "@/components/estate/forms/RecordForm";
import { SubTabs } from "@/components/estate/forms/SubTabs";
import { creditorSections, meetingSections } from "@/data/estateFormSpecs";
import { creditors } from "@/data/estateWorkspace";

const money = (n: number) => `$${n.toLocaleString()}`;

const TABS = [
  { id: "creditors", label: "Creditors" },
  { id: "poc", label: "Proofs of Claim" },
  { id: "meetings", label: "Meetings" },
  { id: "dividends", label: "Dividends" },
] as const;

const CreditorList = () => {
  const [editing, setEditing] = useState<(typeof creditors)[number] | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <>
      <Register
        title="Creditors & liabilities"
        description="Claims reference the master creditor identity; address changes propagate while sent communications keep their address snapshot."
        action={
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add creditor
          </Button>
        }
      >
        <div className="space-y-3">
          {creditors.map((c) => {
            const variance = c.filed - c.soa;
            return (
              <Card key={c.id}>
                <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <Badge variant="outline">{c.priority}</Badge>
                  <Button className="ml-auto" size="sm" variant="outline" onClick={() => setEditing(c)}>
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <dl className="space-y-1.5 text-sm">
                    {[
                      ["SOA", c.soa],
                      ["Filed", c.filed],
                      ["Admitted", c.admitted],
                      ["Voting", c.voting],
                      ["Dividend Eligible", c.dividend],
                    ].map(([label, value]) => (
                      <div key={label as string} className="flex justify-between">
                        <dt className="text-muted-foreground">{label as string}</dt>
                        <dd>{money(value as number)}</dd>
                      </div>
                    ))}
                    <div className="flex justify-between border-t pt-1.5 font-medium">
                      <dt>Variance</dt>
                      <dd className={variance !== 0 ? "text-destructive" : ""}>
                        {variance > 0 ? "+" : ""}
                        {money(variance)}
                      </dd>
                    </div>
                  </dl>
                  <div className="space-y-2 text-sm">
                    {c.note && (
                      <p className="rounded-md border border-destructive/30 bg-destructive/5 p-2">{c.note}</p>
                    )}
                    <p className="text-xs uppercase text-muted-foreground">Evidence</p>
                    <ul className="list-inside list-disc text-muted-foreground">
                      {c.evidence.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Register>

      <RecordDrawer
        open={adding || Boolean(editing)}
        onOpenChange={(o) => {
          if (!o) {
            setAdding(false);
            setEditing(null);
          }
        }}
        title={editing ? `Edit ${editing.name}` : "Add creditor"}
        sections={creditorSections}
        initial={
          editing
            ? {
                masterCreditor: editing.name,
                legalName: editing.name,
                creditorType: editing.priority,
                soaAmount: editing.soa,
                filedAmount: editing.filed,
                admittedVoting: editing.voting,
                admittedDividend: editing.dividend,
                pocFiled: editing.filed > 0,
                claimStatus: "Admitted",
              }
            : {}
        }
        submitLabel="Save creditor"
        onSubmit={() => toast({ title: "Creditor saved" })}
      />
    </>
  );
};

const ProofsOfClaim = () => (
  <Register title="Proofs of claim" description="Status values: Admitted, Contingent, Disallowed, Not proved, Secured asset released, Withdrawn.">
    <div className="space-y-2 text-sm">
      <div className="grid grid-cols-5 gap-2 text-xs uppercase text-muted-foreground">
        <span>Creditor</span>
        <span>Received</span>
        <span>Filed</span>
        <span>Admitted</span>
        <span>Status</span>
      </div>
      {creditors.map((c) => (
        <div key={c.id} className="grid grid-cols-5 gap-2 rounded-md border p-2">
          <span>{c.name}</span>
          <span>2026-08-12</span>
          <span>{money(c.filed)}</span>
          <span>{money(c.admitted)}</span>
          <Badge variant="outline" className="w-fit">Admitted</Badge>
        </div>
      ))}
    </div>
  </Register>
);

const Meetings = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Register
        title="Creditor meetings"
        description="Proven creditors requesting a meeting: 8% of proven claims (threshold 25%)."
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add meeting
          </Button>
        }
      >
        <div className="space-y-2 text-sm">
          <div className="rounded-md border p-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Round 1</Badge>
              <span className="font-medium">Deemed approval — no meeting requested</span>
              <span className="ml-auto text-muted-foreground">2026-06-26</span>
            </div>
          </div>
        </div>
      </Register>
      <RecordDrawer
        open={open}
        onOpenChange={setOpen}
        title="Creditor meeting"
        sections={meetingSections}
        submitLabel="Save meeting"
        onSubmit={() => toast({ title: "Meeting saved" })}
      />
    </>
  );
};

const Dividends = () => (
  <Register title="Dividends" description="Dividend eligibility is derived from admitted claim amounts and ranking.">
    <div className="space-y-2 text-sm">
      {creditors.map((c) => (
        <div key={c.id} className="flex items-center gap-3 rounded-md border p-3">
          <span className="font-medium">{c.name}</span>
          <Badge variant="outline">{c.priority}</Badge>
          <span className="ml-auto text-muted-foreground">Eligible {money(c.dividend)}</span>
        </div>
      ))}
    </div>
  </Register>
);

export const CreditorsTab = () => {
  const [tab, setTab] = useState<string>("creditors");
  return (
    <div className="space-y-4">
      <SubTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "creditors" && <CreditorList />}
      {tab === "poc" && <ProofsOfClaim />}
      {tab === "meetings" && <Meetings />}
      {tab === "dividends" && <Dividends />}
    </div>
  );
};
