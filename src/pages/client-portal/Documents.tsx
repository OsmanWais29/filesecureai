import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientPortal, addClientDocument } from "@/data/clientPortal/store";
import { ClientPageHeading, ClientStatusBadge, EmptyState, formatDate } from "@/components/client-portal/primitives";
import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";

export const ClientDocuments = () => {
  const state = useClientPortal();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const requested = state.requests.filter(
    (r) => ["upload_document", "replace_document", "provide_bank_statement", "sign_document"].includes(r.requestType) &&
      r.status !== "Completed" && r.status !== "Cancelled",
  );
  const mine = state.documents.filter((d) => d.source === "CLIENT_UPLOAD" || d.source === "BANK_PROVIDER");
  const shared = state.documents.filter((d) => d.source === "TRUSTEE_SHARED" && d.sharedWithClient);

  const upload = (files: FileList | null) => {
    if (!files?.length) return;
    Array.from(files).forEach((f) =>
      addClientDocument({
        title: f.name,
        category: "General upload",
        source: "CLIENT_UPLOAD",
        state: "Under review",
        uploadedAt: new Date().toISOString(),
        uploadedBy: "You",
        sharedWithClient: true,
        downloadable: true,
      }),
    );
    toast.success("Uploaded and sent to your trustee");
  };

  const DocRow = ({ title, sub, status }: { title: string; sub: string; status: string }) => (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate font-medium">{title}</p>
            <p className="truncate text-sm text-muted-foreground">{sub}</p>
          </div>
        </div>
        <ClientStatusBadge label={status} />
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <ClientPageHeading
        title="Documents"
        description="Everything you've sent us, everything we've shared with you, and anything still needed."
        actions={
          <label>
            <Button asChild className="h-11">
              <span className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" /> Upload a document
              </span>
            </Button>
            <input type="file" multiple className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => upload(e.target.files)} />
          </label>
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
          {mine.length === 0 ? (
            <EmptyState title="You haven't uploaded anything yet" />
          ) : (
            mine.map((d) => (
              <DocRow
                key={d.id}
                title={d.title}
                sub={`${d.category} · ${formatDate(d.uploadedAt)}`}
                status={d.state}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="shared" className="mt-5 space-y-3">
          {shared.length === 0 ? (
            <EmptyState title="Nothing has been shared with you yet" />
          ) : (
            shared.map((d) => <DocRow key={d.id} title={d.title} sub={d.category} status={d.state} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDocuments;
