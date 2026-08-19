import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RecordDrawer, Register } from "@/components/estate/forms/RecordForm";
import { SubTabs } from "@/components/estate/forms/SubTabs";
import { creditorSections, meetingSections } from "@/data/estateFormSpecs";
import {
  creditorToValues,
  useEstateCreditors,
  useEstateMeetings,
  useSaveCreditor,
  useSaveMeeting,
  type EstateCreditorRow,
} from "@/hooks/useEstateCreditors";

const money = (n: number) => `$${Number(n || 0).toLocaleString()}`;

const TABS = [
  { id: "creditors", label: "Creditors" },
  { id: "poc", label: "Proofs of Claim" },
  { id: "meetings", label: "Meetings" },
  { id: "dividends", label: "Dividends" },
] as const;

const Empty = ({ label }: { label: string }) => (
  <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{label}</p>
);

export const CreditorList = ({ estateId }: { estateId?: string }) => {
  const { data: creditors = [], isLoading } = useEstateCreditors(estateId);
  const save = useSaveCreditor(estateId);
  const [editing, setEditing] = useState<EstateCreditorRow | null>(null);
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
          {isLoading && <Empty label="Loading creditors…" />}
          {!isLoading && creditors.length === 0 && (
            <Empty label="No creditors recorded yet. Add the first creditor to build the claim register." />
          )}
          {creditors.map((c) => {
            const variance = c.filed_amount - c.soa_amount;
            return (
              <Card key={c.id}>
                <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
                  <CardTitle className="text-base">{c.legal_name}</CardTitle>
                  {c.creditor_type && <Badge variant="outline">{c.creditor_type}</Badge>}
                  <Button className="ml-auto" size="sm" variant="outline" onClick={() => setEditing(c)}>
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <dl className="space-y-1.5 text-sm">
                    {[
                      ["SOA", c.soa_amount],
                      ["Filed", c.filed_amount],
                      ["Admitted (voting)", c.admitted_voting],
                      ["Admitted (dividend)", c.admitted_dividend],
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
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={c.poc_filed ? "default" : "outline"}>
                        {c.poc_filed ? "POC filed" : "No POC"}
                      </Badge>
                      {c.claim_status && <Badge variant="outline">{c.claim_status}</Badge>}
                      {c.claim_class && <Badge variant="outline">{c.claim_class}</Badge>}
                      {c.meeting_requested && <Badge variant="outline">Meeting requested</Badge>}
                    </div>
                    {c.reasons && (
                      <p className="rounded-md border border-destructive/30 bg-destructive/5 p-2">{c.reasons}</p>
                    )}
                    <p className="text-muted-foreground">
                      {[c.city, c.province].filter(Boolean).join(", ") || "No address on file"}
                    </p>
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
        title={editing ? `Edit ${editing.legal_name}` : "Add creditor"}
        sections={creditorSections}
        initial={editing ? creditorToValues(editing) : {}}
        submitLabel="Save creditor"
        onSubmit={(values) =>
          save.mutate(
            { values, id: editing?.id },
            {
              onSuccess: () => {
                setAdding(false);
                setEditing(null);
              },
            }
          )
        }
      />
    </>
  );
};

export const ProofsOfClaim = ({ estateId }: { estateId?: string }) => {
  const { data: creditors = [] } = useEstateCreditors(estateId);
  const filed = creditors.filter((c) => c.poc_filed);
  return (
    <Register
      title="Proofs of claim"
      description="Status values: Admitted, Contingent, Disallowed, Not proved, Secured asset released, Withdrawn."
    >
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-5 gap-2 text-xs uppercase text-muted-foreground">
          <span>Creditor</span>
          <span>Received</span>
          <span>Filed</span>
          <span>Admitted</span>
          <span>Status</span>
        </div>
        {filed.length === 0 && <Empty label="No proofs of claim received yet." />}
        {filed.map((c) => (
          <div key={c.id} className="grid grid-cols-5 gap-2 rounded-md border p-2">
            <span>{c.legal_name}</span>
            <span>{c.received_date ?? "—"}</span>
            <span>{money(c.filed_amount)}</span>
            <span>{money(c.admitted_dividend)}</span>
            <Badge variant="outline" className="w-fit">
              {c.claim_status ?? "Pending"}
            </Badge>
          </div>
        ))}
      </div>
    </Register>
  );
};

export const CreditorMeetings = ({ estateId }: { estateId?: string }) => {
  const { data: meetings = [] } = useEstateMeetings(estateId);
  const { data: creditors = [] } = useEstateCreditors(estateId);
  const save = useSaveMeeting(estateId);
  const [open, setOpen] = useState(false);

  const proven = creditors.reduce((s, c) => s + c.admitted_voting, 0);
  const requesting = creditors
    .filter((c) => c.meeting_requested)
    .reduce((s, c) => s + c.admitted_voting, 0);
  const share = proven > 0 ? Math.round((requesting / proven) * 100) : 0;

  return (
    <>
      <Register
        title="Creditor meetings"
        description={`Proven creditors requesting a meeting: ${share}% of proven claims (threshold 25%).`}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add meeting
          </Button>
        }
      >
        <div className="space-y-2 text-sm">
          {meetings.length === 0 && <Empty label="No meetings recorded." />}
          {meetings.map((m) => (
            <div key={m.id} className="rounded-md border p-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Round {m.voting_round ?? 1}</Badge>
                <span className="font-medium">
                  {m.deemed_approval ? "Deemed approval — no meeting requested" : m.location || "Meeting"}
                </span>
                <span className="ml-auto text-muted-foreground">
                  {m.meeting_date ?? m.deemed_approval_date ?? "—"}
                </span>
              </div>
              {m.notes && <p className="mt-1 text-muted-foreground">{m.notes}</p>}
            </div>
          ))}
        </div>
      </Register>
      <RecordDrawer
        open={open}
        onOpenChange={setOpen}
        title="Creditor meeting"
        sections={meetingSections}
        submitLabel="Save meeting"
        onSubmit={(values) => save.mutate(values, { onSuccess: () => setOpen(false) })}
      />
    </>
  );
};

export const CreditorDividends = ({ estateId }: { estateId?: string }) => {
  const { data: creditors = [] } = useEstateCreditors(estateId);
  const eligible = creditors.filter((c) => c.admitted_dividend > 0);
  const total = eligible.reduce((s, c) => s + c.admitted_dividend, 0);
  return (
    <Register
      title="Dividends"
      description="Dividend eligibility is derived from admitted claim amounts and ranking."
    >
      <div className="space-y-2 text-sm">
        {eligible.length === 0 && <Empty label="No claims admitted for dividend yet." />}
        {eligible.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-md border p-3">
            <span className="font-medium">{c.legal_name}</span>
            {c.claim_class && <Badge variant="outline">{c.claim_class}</Badge>}
            <span className="ml-auto text-muted-foreground">Eligible {money(c.admitted_dividend)}</span>
          </div>
        ))}
        {eligible.length > 0 && (
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Total admitted for dividend</span>
            <span>{money(total)}</span>
          </div>
        )}
      </div>
    </Register>
  );
};

export const CreditorsTab = ({ estateId }: { estateId?: string }) => {
  const [tab, setTab] = useState<string>("creditors");
  return (
    <div className="space-y-4">
      <SubTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "creditors" && <CreditorList estateId={estateId} />}
      {tab === "poc" && <ProofsOfClaim estateId={estateId} />}
      {tab === "meetings" && <CreditorMeetings estateId={estateId} />}
      {tab === "dividends" && <CreditorDividends estateId={estateId} />}
    </div>
  );
};
