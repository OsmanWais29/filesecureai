import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClientRequest, REQUEST_TYPE_LABELS } from "@/data/clientPortal/types";
import { ClientStatusBadge, dueLabel } from "./primitives";
import { AlertCircle, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

/** Where a request type sends the client to actually complete the action. */
export const requestActionTarget = (r: ClientRequest) => {
  switch (r.requestType) {
    case "complete_income_statement":
      return { label: "Complete statement", to: "/client-portal/income" };
    case "connect_bank_account":
      return { label: "Connect bank account", to: "/client-portal/banking" };
    case "authorize_pad":
      return { label: "Review authorization", to: "/client-portal/banking" };
    case "provide_payment_information":
      return { label: "Open payments", to: "/client-portal/banking" };
    case "contact_trustee":
      return { label: "Send message", to: "/client-portal/messages" };
    case "replace_document":
      return { label: "Replace document", to: `/client-portal/tasks?request=${r.id}` };
    case "provide_bank_statement":
      return { label: "Upload statement", to: `/client-portal/tasks?request=${r.id}` };
    case "sign_document":
      return { label: "Review & sign", to: `/client-portal/tasks?request=${r.id}` };
    default:
      return { label: "Open request", to: `/client-portal/tasks?request=${r.id}` };
  }
};

export const ActionRequiredCard = ({
  request,
  onOpen,
  compact,
}: {
  request: ClientRequest;
  onOpen?: (r: ClientRequest) => void;
  compact?: boolean;
}) => {
  const navigate = useNavigate();
  const due = dueLabel(request.dueDate);
  const target = requestActionTarget(request);
  const needsAction =
    request.status === "Action Required" || request.status === "More Information Needed" || request.status === "Reopened";

  return (
    <Card className={cn("transition-shadow hover:shadow-sm", needsAction && "border-l-4 border-l-primary")}>
      <CardContent className={cn("flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between", compact && "p-4")}>
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{request.title}</h3>
            <ClientStatusBadge label={request.status} />
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">{request.description}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-xs text-muted-foreground">
            <span>{REQUEST_TYPE_LABELS[request.requestType]}</span>
            {due && (
              <span className={cn("inline-flex items-center gap-1", due.urgent && "font-medium text-destructive")}>
                {due.urgent ? <AlertCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                {due.text}
              </span>
            )}
            <span>Requested by {request.requestedByName}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {onOpen && (
            <Button variant="outline" size="lg" className="h-11" onClick={() => onOpen(request)}>
              Details
            </Button>
          )}
          {needsAction && (
            <Button size="lg" className="h-11" onClick={() => navigate(target.to)}>
              {target.label}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
