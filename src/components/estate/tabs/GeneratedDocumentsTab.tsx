import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/estate/PageHeading";
import { StatusBadge } from "@/components/estate/StatusBadge";
import { Register } from "@/components/estate/forms/RecordForm";
import { useEstateForms } from "@/hooks/useEstateForms";
import { documents } from "@/data/estateWorkspace";
import { Link } from "react-router-dom";

interface Props {
  estateId?: string;
  title: string;
  description?: string;
}

export const GeneratedDocumentsTab = ({ estateId, title, description }: Props) => {
  const { items } = useEstateForms(estateId);
  const generated = items.filter((i) => i.instance?.generated_at || i.instance?.filed_at);

  return (
    <>
      <PageHeading title={title} description={description} />
      <Register title="Generated & filed forms" description={`${generated.length} document(s) produced from the form catalogue.`}>
        <div className="space-y-2 text-sm">
          {generated.length === 0 && (
            <p className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
              Nothing generated yet. Generate a form from Documents → Forms.
            </p>
          )}
          {generated.map((i) => (
            <div key={i.number} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
              <Badge variant="outline">{i.number}</Badge>
              <span className="font-medium">{i.title}</span>
              <StatusBadge label={i.instance?.filed_at ? "Complete" : "In Progress"} />
              <span className="ml-auto text-xs text-muted-foreground">
                {i.instance?.filed_at
                  ? `Filed ${i.instance.filed_at}`
                  : `Generated ${i.instance?.generated_at ?? "—"}`}
              </span>
            </div>
          ))}
        </div>
      </Register>
    </>
  );
};

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