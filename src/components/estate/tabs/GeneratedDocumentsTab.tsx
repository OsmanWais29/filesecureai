import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/estate/PageHeading";
import { StatusBadge } from "@/components/estate/StatusBadge";
import { Register } from "@/components/estate/forms/RecordForm";
import { documents } from "@/data/estateWorkspace";
import { Link } from "react-router-dom";

interface Props {
  estateId?: string;
  title: string;
  description?: string;
}

export const DocumentVersionsTab = ({ title, description }: Omit<Props, "estateId">) => (
  <>
    <PageHeading
      title={title}
      description={description}
      actions={
        <Button variant="outline" size="sm" asChild>
          <Link to="/documents">Open document management</Link>
        </Button>
      }
    />
    <Register title="Document versions" description="Extraction state and evidence linkage per uploaded document.">
      <div className="space-y-2 text-sm">
        {documents.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
            <span className="font-medium">{d.name}</span>
            <Badge variant="outline">{d.type}</Badge>
            <StatusBadge label={d.extraction === "Complete" ? "Complete" : "Human Review"} />
            <span className="text-xs text-muted-foreground">Hash: {d.hash}</span>
            <span className="ml-auto text-xs text-muted-foreground">Received {d.received}</span>
          </div>
        ))}
      </div>
    </Register>
  </>
);