import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useClientPortal, openRequests } from "@/data/clientPortal/store";
import { ClientPageHeading, ClientStatusBadge, EmptyState, formatDate, formatMoney } from "@/components/client-portal/primitives";
import { ActionRequiredCard } from "@/components/client-portal/ClientRequestCard";
import { ClientRequestDetail } from "@/components/client-portal/ClientRequestDetail";
import { ClientRequest } from "@/data/clientPortal/types";
import { CalendarClock, CheckCircle2, Landmark, MessageSquare, Wallet } from "lucide-react";

export const ClientDashboard = () => {
  const state = useClientPortal();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<ClientRequest | null>(null);

  const actionable = openRequests(state);
  const inReview = state.requests.filter((r) => r.status === "Submitted" || r.status === "Under Review");
  const completed = state.requests.filter((r) => r.status === "Completed");
  const total = state.requests.filter((r) => r.status !== "Cancelled").length || 1;
  const progress = Math.round((completed.length / total) * 100);

  const nextPayment = state.schedules
    .filter((s) => s.nextPaymentDate)
    .sort((a, b) => (a.nextPaymentDate! < b.nextPaymentDate! ? -1 : 1))[0];
  const nextAppointment = state.appointments
    .filter((a) => a.status === "Scheduled" && new Date(a.scheduledAt) > new Date())
    .sort((a, b) => (a.scheduledAt < b.scheduledAt ? -1 : 1))[0];
  const connection = state.connections.find((c) => c.status === "connected");
  const openIncome = state.incomePeriods.find(
    (p) => p.status === "Not started" || p.status === "Draft" || p.status === "More information needed",
  );

  return (
    <div className="mx-auto max-w-5xl">
      <ClientPageHeading
        title={`Hello, ${state.profile.name.split(" ")[0]}`}
        description={`${state.profile.proceedingLabel} · Your trustee is ${state.profile.trusteeName}. Everything you need to do is listed below.`}
      />

      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              {actionable.length === 0
                ? "You're all caught up"
                : `${actionable.length} thing${actionable.length === 1 ? "" : "s"} need your attention`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {inReview.length > 0
                ? `${inReview.length} item${inReview.length === 1 ? " is" : "s are"} with your trustee for review.`
                : "Nothing is currently waiting on your trustee."}
            </p>
          </div>
          <div className="w-full sm:w-56">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Your file progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">What I need to do</h2>
        {actionable.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="h-8 w-8 text-accent" />}
            title="Nothing outstanding right now"
            body="We'll email you and post here as soon as your trustee needs something."
          />
        ) : (
          <div className="space-y-3">
            {actionable.slice(0, 4).map((r) => (
              <ActionRequiredCard key={r.id} request={r} onOpen={setSelected} />
            ))}
            {actionable.length > 4 && (
              <Button variant="outline" className="h-11 w-full" onClick={() => navigate("/client-portal/tasks")}>
                View all {actionable.length} items
              </Button>
            )}
          </div>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4 text-muted-foreground" /> Your payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {nextPayment ? (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Next payment</span>
                  <span className="text-lg font-semibold">{formatMoney(nextPayment.amount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Scheduled for</span>
                  <span className="font-medium text-foreground">{formatDate(nextPayment.nextPaymentDate)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Method</span>
                  <ClientStatusBadge label={nextPayment.status} />
                </div>
                <Separator />
                <Button variant="outline" className="h-11 w-full" onClick={() => navigate("/client-portal/banking")}>
                  View payment details
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">No payment arrangement is set up yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Landmark className="h-4 w-4 text-muted-foreground" /> Bank connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {connection ? (
              <>
                <p className="font-medium">
                  {connection.institutionName} {connection.accountMask}
                </p>
                <p className="text-muted-foreground">
                  Last updated {formatDate(connection.lastSyncedAt)}. You can disconnect at any time.
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                No bank account connected. Connecting one lets your trustee confirm your income without you gathering paperwork.
              </p>
            )}
            <Button variant="outline" className="h-11 w-full" onClick={() => navigate("/client-portal/banking")}>
              {connection ? "Manage connection" : "Connect a bank account"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="h-4 w-4 text-muted-foreground" /> Next appointment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {nextAppointment ? (
              <>
                <p className="font-medium">{nextAppointment.title}</p>
                <p className="text-muted-foreground">
                  {formatDate(nextAppointment.scheduledAt)} · {nextAppointment.method}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No appointments scheduled.</p>
            )}
            <Button variant="outline" className="h-11 w-full" onClick={() => navigate("/client-portal/appointments")}>
              View appointments
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-muted-foreground" /> Monthly reporting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {openIncome ? (
              <>
                <p className="font-medium">{openIncome.periodLabel} statement</p>
                <p className="text-muted-foreground">Due {formatDate(openIncome.dueDate)}</p>
              </>
            ) : (
              <p className="text-muted-foreground">Your statements are up to date.</p>
            )}
            <Button variant="outline" className="h-11 w-full" onClick={() => navigate("/client-portal/income")}>
              Open income & expenses
            </Button>
          </CardContent>
        </Card>
      </div>

      <ClientRequestDetail request={selected} open={!!selected} onOpenChange={(v) => !v && setSelected(null)} />
    </div>
  );
};

export default ClientDashboard;
