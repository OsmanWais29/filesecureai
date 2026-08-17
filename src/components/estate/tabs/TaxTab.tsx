import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RecordDrawer, Register } from "@/components/estate/forms/RecordForm";
import { SubTabs } from "@/components/estate/forms/SubTabs";
import { requiredTaxDocSections, taxReturnSections } from "@/data/estateFormSpecs";

const TABS = [
  { id: "returns", label: "Tax Returns" },
  { id: "documents", label: "Required Documents" },
] as const;

const returns = [
  { id: "tr1", type: "Pre-bankruptcy", year: 2026, source: "CRA", estimated: 1200, deposited: 0, status: "In preparation", assessed: "—" },
  { id: "tr2", type: "Prior year", year: 2025, source: "CRA", estimated: 800, deposited: 800, status: "Assessed", assessed: "2026-06-18" },
];

const docs = [
  { id: "rd1", doc: "T4", year: 2025, required: true, received: true, verified: true },
  { id: "rd2", doc: "T5", year: 2025, required: true, received: false, verified: false },
];

export const TaxTab = () => {
  const [tab, setTab] = useState<string>("returns");
  const [openReturn, setOpenReturn] = useState(false);
  const [openDoc, setOpenDoc] = useState(false);

  return (
    <div className="space-y-4">
      <SubTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "returns" && (
        <Register
          title="Tax administration"
          action={
            <Button size="sm" onClick={() => setOpenReturn(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add return
            </Button>
          }
        >
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-7 gap-2 text-xs uppercase text-muted-foreground">
              <span>Type</span>
              <span>Year</span>
              <span>Source</span>
              <span>Estimated</span>
              <span>Deposited</span>
              <span>Status</span>
              <span>Assessed</span>
            </div>
            {returns.map((r) => (
              <div key={r.id} className="grid grid-cols-7 gap-2 rounded-md border p-2">
                <span>{r.type}</span>
                <span>{r.year}</span>
                <span>{r.source}</span>
                <span>${r.estimated.toLocaleString()}</span>
                <span>${r.deposited.toLocaleString()}</span>
                <Badge variant="outline" className="w-fit">{r.status}</Badge>
                <span>{r.assessed}</span>
              </div>
            ))}
          </div>
        </Register>
      )}

      {tab === "documents" && (
        <Register
          title="Required tax documents"
          description="Each checklist row links to the SecureFiles document engine."
          action={
            <Button size="sm" onClick={() => setOpenDoc(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add requirement
            </Button>
          }
        >
          <div className="space-y-2 text-sm">
            {docs.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
                <span className="font-medium">{d.doc}</span>
                <span className="text-muted-foreground">{d.year}</span>
                <Badge variant="outline">{d.required ? "Required" : "Optional"}</Badge>
                <Badge variant={d.received ? "secondary" : "destructive"}>
                  {d.received ? "Received" : "Outstanding"}
                </Badge>
                {d.verified && <Badge variant="secondary">Verified</Badge>}
              </div>
            ))}
          </div>
        </Register>
      )}

      <RecordDrawer
        open={openReturn}
        onOpenChange={setOpenReturn}
        title="Tax return"
        sections={taxReturnSections}
        submitLabel="Save return"
        onSubmit={() => toast({ title: "Tax return saved" })}
      />
      <RecordDrawer
        open={openDoc}
        onOpenChange={setOpenDoc}
        title="Required tax document"
        sections={requiredTaxDocSections}
        submitLabel="Save requirement"
        onSubmit={() => toast({ title: "Requirement saved" })}
      />
    </div>
  );
};
