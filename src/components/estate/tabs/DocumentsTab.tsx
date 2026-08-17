import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { documents } from "@/data/estateWorkspace";

export const DocumentsTab = () => (
  <div className="space-y-4">
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
