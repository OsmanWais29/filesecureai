import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePortalSession } from "@/data/clientPortal/session";
import { openRequestList, usePortalDocuments, usePortalIntake, usePortalRequests } from "@/data/clientPortal/db";
import { INTAKE_SECTIONS } from "@/data/clientPortal/intakeSpec";
import { ClientPageHeading, EmptyState, formatDate } from "@/components/client-portal/primitives";
import { ActionRequiredCard } from "@/components/client-portal/ClientRequestCard";
import { ClientRequestDetail } from "@/components/client-portal/ClientRequestDetail";
import { ClientRequest } from "@/data/clientPortal/types";
import { CheckCircle2, ClipboardList, FileText, Loader2, MessageSquare, Wallet } from "lucide-react";

/**
 * Client home. Answers one question first — "what do I need to do next?" — then
 * shows what is with the trustee. Every number comes from real records on the
 * estate the invitation authorized.
 */
export const ClientDashboard = () => {
  const navigate = useNavigate();
  const { session, loading } = usePortalSession();
  const { data: requests = [], isLoading: reqLoading } = usePortalRequests(session?.estateId);
  const { data: documents = [] } = usePortalDocuments(session?.estateId);
  const { data: intake = [] } = usePortalIntake(session?.estateId);
  const [selected, setSelected] = useState<ClientRequest | null>(null);

  const actionable = openRequestList(requests);
  const inReview = requests.filter((r) => r.status === "Submitted" || r.status === "Under Review");
  const completed = requests.filter((r) => r.status === "Completed");
  const intakeDone = INTAKE_SECTIONS.filter((s) => {
    const r = intake.find((x) => x.sectionKey === s.key);
    return r?.status === "submitted" || r?.status === "accepted";
  }).length;
  const intakePct = Math.round((intakeDone / INTAKE_SECTIONS.length) * 100);

  if (loading || reqLoading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const next = actionable[0];

  return (
    <div className="mx-auto max-w-4xl">
      <ClientPageHeading
        title={`Hello, ${session?.name?.split(" ")[0] ?? "there"}`}
        description={
          session?.fileNumber
            ? `${session.proceedingLabel ?? "Your file"} · File ${session.fileNumber}${session.firmName ? ` · ${session.firmName}` : ""}`
            : session?.firmName
        }
      />

      <Card className="mb-6 border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-lg">What I need to do next</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {next ? (
            <>
              <ActionRequiredCard request={next} onOpen={setSelected} />
              {actionable.length > 1 && (
                <Button variant="outline" className="h-11" onClick={() => navigate("/client-portal/tasks")}>
                  See all {actionable.length} items
                </Button>
              )}
            </>
          ) : (
            <EmptyState
              icon={<CheckCircle2 className="h-8 w-8 text-accent" />}
              title="Nothing needs your action right now"
              body="We'll let you know as soon as your trustee needs something from you."
            />
          )}
        </CardContent>
      </Card>

      {intakePct < 100 && (
        <Card className="mb-6">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="min-w-0 space-y-2">
              <p className="font-medium">Finish telling us about your situation</p>
              <p className="text-sm text-muted-foreground">
                {intakeDone} of {INTAKE_SECTIONS.length} sections sent. You can stop and come back any time.
              </p>
              <Progress value={intakePct} className="h-2 w-56" />
            </div>
            <Button className="h-11" onClick={() => navigate("/client-portal/information")}>
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="With your trustee" value={inReview.length} hint="Waiting on review" to="/client-portal/tasks" icon={ClipboardList} />
        <StatCard label="Documents sent" value={documents.length} hint="Everything you've shared" to="/client-portal/documents" icon={FileText} />
        <StatCard label="Completed" value={completed.length} hint="Accepted by your trustee" to="/client-portal/tasks" icon={CheckCircle2} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <QuickAction
          icon={Wallet}
          title="Income & expenses"
          body="Report what you earned and spent this month."
          to="/client-portal/income"
        />
        <QuickAction
          icon={MessageSquare}
          title="Message your trustee"
          body="Ask a question or tell us about a change."
          to="/client-portal/messages"
        />
      </div>

      {inReview.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            With your trustee
          </h2>
          <div className="space-y-3">
            {inReview.map((r) => (
              <ActionRequiredCard key={r.id} request={r} onOpen={setSelected} compact />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <p className="mt-8 text-sm text-muted-foreground">
          Last item accepted on {formatDate(completed[0]?.completedAt)}.
        </p>
      )}

      <ClientRequestDetail request={selected} open={!!selected} onOpenChange={(v) => !v && setSelected(null)} />
    </div>
  );
};

const StatCard = ({
  label,
  value,
  hint,
  to,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}) => {
  const navigate = useNavigate();
  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-sm" onClick={() => navigate(to)}>
      <CardContent className="space-y-1 p-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span className="text-sm">{label}</span>
        </div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
};

const QuickAction = ({
  icon: Icon,
  title,
  body,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  to: string;
}) => {
  const navigate = useNavigate();
  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-sm" onClick={() => navigate(to)}>
      <CardContent className="flex items-start gap-3 p-5">
        <Icon className="mt-0.5 h-5 w-5 text-primary" />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{body}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientDashboard;
