import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ClientRequest, REQUEST_TYPE_LABELS } from "@/data/clientPortal/types";
import { ClientStatusBadge, formatDate, formatDateTime } from "./primitives";
import { DocumentRequestUploader } from "./DocumentRequestUploader";
import { submitClientRequest, markRequestViewed } from "@/data/clientPortal/store";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { requestActionTarget } from "./ClientRequestCard";

/**
 * Client-facing request detail. Renders only client-safe fields — staff notes and
 * internal signal references are never passed into this component.
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
  const [response, setResponse] = useState("");
  const [uploaded, setUploaded] = useState<string[]>([]);

  if (!request) return null;

  const needsAction =
    request.status === "Action Required" || request.status === "More Information Needed" || request.status === "Reopened";
  const needsUpload = ["upload_document", "replace_document", "provide_bank_statement", "sign_document"].includes(
    request.requestType,
  );
  const target = requestActionTarget(request);

  const handleSubmit = () => {
    if (needsUpload && uploaded.length === 0) {
      toast.error("Please attach the requested document first.");
      return;
    }
    submitClientRequest(request.id, response || "Submitted through the portal.", uploaded);
    toast.success("Sent to your trustee", { description: "You will be notified once it has been reviewed." });
    setResponse("");
    setUploaded([]);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (v) markRequestViewed(request.id);
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

        {needsAction ? (
          <div className="space-y-5">
            {needsUpload ? (
              <DocumentRequestUploader
                request={request}
                onUploaded={(ids) => setUploaded((prev) => [...prev, ...ids])}
              />
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

            <Button className="h-11 w-full" onClick={handleSubmit}>
              Send to my trustee
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
