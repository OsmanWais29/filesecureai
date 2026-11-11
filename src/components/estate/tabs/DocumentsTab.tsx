import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { documents } from "@/data/estateWorkspace";
import { useEstateFiledDocuments } from "@/hooks/useEstateForms";

const ROLE_LABEL: Record<string, string> = { draft: "Draft", signed: "Signed", filed: "Filed", osb_response: "OSB response", received: "Received" };

const EstateFilings = ({ estateId }: { estateId?: string }) => {
  const { data = [], isLoading } = useEstateFiledDocuments(estateId);
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">This estate's saved documents</CardTitle>
        <p className="text-xs text-muted-foreground">Filed forms are saved here automatically when you sign and file.</p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {!isLoading && data.length === 0 && <p className="text-muted-foreground">Nothing saved yet.</p>}
        {data.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center gap-2 rounded-md border p-2">
            <span className="font-medium">{d.title}</span>
            <Badge variant="outline">{ROLE_LABEL[d.metadata?.role] ?? "Received"}</Badge>
            {d.metadata?.version && <Badge variant="secondary">{d.metadata.version}</Badge>}
            <span className="ml-auto text-xs text-muted-foreground">{d.created_at.slice(0, 10)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export const DocumentsTab = ({ estateId }: { estateId?: string }) => (
  <div className="space-y-4">
    <EstateFilings estateId={estateId} />
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Documents are the evidence behind estate values — each extraction links back to the field it supports.
      </p>
      <Button variant="outline" size="sm" asChild>
        <Link to="/documents">Open document management</Link>
      </Button>
    </div>
    {documents.map((d) => (
      <Card key={d.id}>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">{d.name}</CardTitle>
            <Badge variant="outline">{d.type}</Badge>
            <Badge variant="secondary">Hash {d.hash}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <dl className="space-y-1.5">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Creditor</dt>
              <dd>{d.creditor}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Received</dt>
              <dd>{d.received}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">SAFA extraction</dt>
              <dd>{d.extraction}</dd>
            </div>
          </dl>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Evidence used in</p>
            <ul className="mt-1 list-inside list-disc text-muted-foreground">
              {d.evidenceFor.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
