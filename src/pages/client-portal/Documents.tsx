import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortalSession } from "@/data/clientPortal/session";
import { PortalDocument, portalDocumentUrl, uploadPortalDocument, usePortalDocuments, usePortalRequests } from "@/data/clientPortal/db";
import { ClientPageHeading, ClientStatusBadge, EmptyState, formatDate } from "@/components/client-portal/primitives";
import { Download, FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

export const ClientDocuments = () => {
  const { session } = usePortalSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");

  const { data: documents = [], isLoading } = usePortalDocuments(session?.estateId);
  const { data: requests = [] } = usePortalRequests(session?.estateId);

  const requested = requests.filter(
    (r) =>
      ["upload_document", "replace_document", "provide_bank_statement", "sign_document"].includes(r.requestType) &&
      r.status !== "Completed" &&
      r.status !== "Cancelled",
  );
  const mine = documents.filter((d) => d.source === "CLIENT_UPLOAD" || d.source === "BANK_PROVIDER");
  const shared = documents.filter((d) => d.source === "TRUSTEE_SHARED");

  const upload = async (files: FileList | null) => {
    if (!files?.length || !session) return;
    setBusy(true);
    let ok = 0;
    for (const file of Array.from(files)) {
      try {
        await uploadPortalDocument({
          estateId: session.estateId,
          file,
          actor: { userId: session.userId, name: session.name },
          category: "General upload",
        });
        ok++;
      } catch (e) {
        toast.error(`Could not upload ${file.name}`, { description: (e as Error).message });
      }
    }
    setBusy(false);
    qc.invalidateQueries({ queryKey: ["portal-documents", session.estateId] });
    if (ok) toast.success(`${ok} file${ok === 1 ? "" : "s"} sent to your trustee`);
  };

  const open = async (doc: PortalDocument) => {
    try {
      window.open(await portalDocumentUrl(doc.storagePath), "_blank", "noopener");
    } catch (e) {
      toast.error("Could not open this file", { description: (e as Error).message });
    }
  };

  const DocRow = ({ doc }: { doc: PortalDocument }) => (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate font-medium">{doc.title}</p>
            <p className="truncate text-sm text-muted-foreground">
              {doc.category} · {formatDate(doc.uploadedAt)}
              {doc.version > 1 ? ` · version ${doc.version}` : ""}
            </p>
            {doc.reviewNote && <p className="mt-1 text-sm text-destructive">{doc.reviewNote}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ClientStatusBadge label={doc.state} />
          <Button variant="ghost" size="icon" onClick={() => void open(doc)} aria-label={`Open ${doc.title}`}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <ClientPageHeading
        title="Documents"
        description="Everything you've sent us, everything we've shared with you, and anything still needed."
        actions={
          <>
            <Button className="h-11" disabled={busy || !session} onClick={() => inputRef.current?.click()}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload a document
            </Button>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.heic,.webp"
              onChange={(e) => void upload(e.target.files)}
            />
          </>
        }
      />

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">Needed ({requested.length})</TabsTrigger>
          <TabsTrigger value="mine">Sent by me ({mine.length})</TabsTrigger>
          <TabsTrigger value="shared">Shared with me ({shared.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-5 space-y-3">
          {requested.length === 0 ? (
            <EmptyState title="No documents are outstanding" />
          ) : (
            requested.map((r) => (
              <Card key={r.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">{r.title}</p>
                    <p className="text-sm text-muted-foreground">Due {formatDate(r.dueDate)}</p>
                  </div>
                  <Button className="h-11" onClick={() => navigate(`/client-portal/tasks?request=${r.id}`)}>
                    Provide document
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="mine" className="mt-5 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : mine.length === 0 ? (
            <EmptyState title="You haven't uploaded anything yet" />
          ) : (
            mine.map((d) => <DocRow key={d.id} doc={d} />)
          )}
        </TabsContent>

        <TabsContent value="shared" className="mt-5 space-y-3">
          {shared.length === 0 ? (
            <EmptyState title="Nothing has been shared with you yet" />
          ) : (
            shared.map((d) => <DocRow key={d.id} doc={d} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDocuments;
