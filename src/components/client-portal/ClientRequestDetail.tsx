import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ClientRequest, REQUEST_TYPE_LABELS } from "@/data/clientPortal/types";
import { ClientStatusBadge, formatDate, formatDateTime } from "./primitives";
import { DocumentRequestUploader } from "./DocumentRequestUploader";
import { usePortalSession } from "@/data/clientPortal/session";
import { usePortalDocuments, usePortalRequestActions } from "@/data/clientPortal/db";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { requestActionTarget } from "./ClientRequestCard";
import { FileText } from "lucide-react";

/**
 * Client-facing request detail. Renders only client-safe fields — staff notes
 * live in a separate, staff-only table and are never fetched here.
 */
export const ClientRequestDetail = ({
  request,
  open,
  onOpenChange,
}: {
  request: ClientRequest | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const navigate = useNavigate();
  const { session } = usePortalSession();
  const actor = session ? { userId: session.userId, name: session.name } : undefined;
  const { markViewed, submit } = usePortalRequestActions(session?.estateId, actor);
  const { data: documents = [] } = usePortalDocuments(session?.estateId);
  const [response, setResponse] = useState("");
  const [uploadedCount, setUploadedCount] = useState(0);

  if (!request) return null;

  const attached = documents.filter((d) => d.requestId === request.id);
  const needsAction =
    request.status === "Action Required" || request.status === "More Information Needed" || request.status === "Reopened";
  const needsUpload = ["upload_document", "replace_document", "provide_bank_statement", "sign_document"].includes(
    request.requestType,
  );
  const target = requestActionTarget(request);

  const handleSubmit = async () => {
    if (needsUpload && attached.length + uploadedCount === 0) {
      toast.error("Please attach the requested document first.");
      return;
    }
    try {
      await submit.mutateAsync({ request, response: response || "Submitted through the portal." });
      toast.success("Sent to your trustee", { description: "You will be notified once it has been reviewed." });
      setResponse("");
      setUploadedCount(0);
      onOpenChange(false);
    } catch (e) {
      toast.error("Could not send this yet", { description: (e as Error).message });
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (v) void markViewed.mutateAsync(request).catch(() => undefined);
        onOpenChange(v);
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-2 text-left">
          <ClientStatusBadge label={request.status} />
          <SheetTitle className="text-xl">{request.title}</SheetTitle>
          <SheetDescription className="text-base text-muted-foreground">{request.description}</SheetDescription>
        </SheetHeader>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">What is needed</dt>
            <dd className="mt-0.5 font-medium">{REQUEST_TYPE_LABELS[request.requestType]}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Due</dt>
            <dd className="mt-0.5 font-medium">{formatDate(request.dueDate)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Requested by</dt>
            <dd className="mt-0.5 font-medium">{request.requestedByName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Requested on</dt>
            <dd className="mt-0.5 font-medium">{formatDateTime(request.requestedAt)}</dd>
          </div>
        </dl>

        <Separator className="my-6" />

        {attached.length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Files you have sent</p>
            {attached.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{d.fileName}</span>
                </span>
                <ClientStatusBadge label={d.state} />
              </div>
            ))}
          </div>
        )}

        {needsAction ? (
          <div className="space-y-5">
            {needsUpload ? (
              <DocumentRequestUploader request={request} onUploaded={(ids) => setUploadedCount((c) => c + ids.length)} />
            ) : (
              <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                <p className="text-muted-foreground">This request is completed elsewhere in your portal.</p>
                <Button className="mt-3 h-11" onClick={() => navigate(target.to)}>
                  {target.label}
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="client-response">Add a note for your trustee (optional)</Label>
              <Textarea
                id="client-response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Anything we should know about this?"
                rows={4}
              />
            </div>

            <Button className="h-11 w-full" disabled={submit.isPending} onClick={() => void handleSubmit()}>
              {submit.isPending ? "Sending…" : "Send to my trustee"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Your trustee reviews everything you send. This request is marked complete only after their review.
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            {request.clientResponse && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Your response</p>
                <p className="mt-1">{request.clientResponse}</p>
              </div>
            )}
            <p className="text-muted-foreground">
              {request.status === "Completed"
                ? `Accepted by your trustee on ${formatDate(request.completedAt)}. Nothing further is needed.`
                : "Your trustee has received this and is reviewing it. We will let you know if anything else is needed."}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
