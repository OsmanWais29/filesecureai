import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RecordDrawer, Register } from "@/components/estate/forms/RecordForm";
import { SubTabs } from "@/components/estate/forms/SubTabs";
import { requiredTaxDocSections, taxReturnSections } from "@/data/estateFormSpecs";
import {
  taxDocumentToValues,
  taxReturnToValues,
  useSaveTaxDocument,
  useSaveTaxReturn,
  useTaxDocuments,
  useTaxReturns,
  type TaxDocumentRow,
  type TaxReturnRow,
} from "@/hooks/useEstateStatutory";

const money = (n: number) => `$${Number(n || 0).toLocaleString()}`;

const TABS = [
  { id: "returns", label: "Tax Returns" },
  { id: "documents", label: "Required Documents" },
] as const;

const Empty = ({ label }: { label: string }) => (
  <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{label}</p>
);

export const TaxReturnsRegister = ({ estateId }: { estateId?: string }) => {
  const { data: returns = [] } = useTaxReturns(estateId);
  const saveReturn = useSaveTaxReturn(estateId);
  const [returnDraft, setReturnDraft] = useState<{ open: boolean; row?: TaxReturnRow }>({ open: false });

  return (
    <>
      <Register
          title="Tax administration"
          description={`${returns.length} return(s) tracked. Refunds deposited into the estate are recorded as receipts in Financials.`}
          action={
            <Button size="sm" onClick={() => setReturnDraft({ open: true })}>
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
              <span />
            </div>
            {returns.length === 0 && <Empty label="No tax returns recorded yet." />}
            {returns.map((r) => (
              <div key={r.id} className="grid grid-cols-7 items-center gap-2 rounded-md border p-2">
                <span>{r.return_type ?? "—"}</span>
                <span>{r.year ?? "—"}</span>
                <span>{r.source ?? "—"}</span>
                <span>{money(r.estimated_amount)}</span>
                <span>{money(r.amount_deposited)}</span>
                <Badge variant="outline" className="w-fit">
                  {r.status ?? "Pending"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="justify-self-end"
                  onClick={() => setReturnDraft({ open: true, row: r })}
                >
                  Edit
                </Button>
              </div>
            ))}
        </div>
      </Register>

      <RecordDrawer
        open={returnDraft.open}
        onOpenChange={(o) => setReturnDraft({ open: o })}
        title={returnDraft.row ? "Edit tax return" : "Tax return"}
        sections={taxReturnSections}
        initial={returnDraft.row ? taxReturnToValues(returnDraft.row) : {}}
        submitLabel="Save return"
        onSubmit={(values) =>
          saveReturn.mutate(
            { values, id: returnDraft.row?.id },
            { onSuccess: () => setReturnDraft({ open: false }) }
          )
        }
      />
    </>
  );
};

export const RequiredDocumentsRegister = ({ estateId }: { estateId?: string }) => {
  const { data: docs = [] } = useTaxDocuments(estateId);
  const saveDoc = useSaveTaxDocument(estateId);
  const [docDraft, setDocDraft] = useState<{ open: boolean; row?: TaxDocumentRow }>({ open: false });
  const outstandingDocs = docs.filter((d) => d.required && !d.received).length;

  return (
    <>
      <Register
          title="Required tax documents"
          description={`${outstandingDocs} required document(s) still outstanding.`}
          action={
            <Button size="sm" onClick={() => setDocDraft({ open: true })}>
              <Plus className="mr-1.5 h-4 w-4" /> Add requirement
            </Button>
          }
        >
        <div className="space-y-2 text-sm">
            {docs.length === 0 && <Empty label="No document requirements recorded yet." />}
            {docs.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
                <span className="font-medium">{d.doc_type ?? "Document"}</span>
                <span className="text-muted-foreground">{d.tax_year ?? "—"}</span>
                <Badge variant="outline">{d.required ? "Required" : "Optional"}</Badge>
                <Badge variant={d.received ? "secondary" : "destructive"}>
                  {d.received ? "Received" : "Outstanding"}
                </Badge>
                {d.verified && <Badge variant="secondary">Verified</Badge>}
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto"
                  onClick={() => setDocDraft({ open: true, row: d })}
                >
                  Edit
                </Button>
              </div>
            ))}
        </div>
      </Register>

      <RecordDrawer
        open={docDraft.open}
        onOpenChange={(o) => setDocDraft({ open: o })}
        title={docDraft.row ? "Edit requirement" : "Required tax document"}
        sections={requiredTaxDocSections}
        initial={docDraft.row ? taxDocumentToValues(docDraft.row) : { required: true }}
        submitLabel="Save requirement"
        onSubmit={(values) =>
          saveDoc.mutate({ values, id: docDraft.row?.id }, { onSuccess: () => setDocDraft({ open: false }) })
        }
      />
    </>
  );
};

export const TaxTab = ({ estateId }: { estateId?: string }) => {
  const [tab, setTab] = useState<string>("returns");
  return (
    <div className="space-y-4">
      <SubTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "returns" && <TaxReturnsRegister estateId={estateId} />}
      {tab === "documents" && <RequiredDocumentsRegister estateId={estateId} />}
    </div>
  );
};
