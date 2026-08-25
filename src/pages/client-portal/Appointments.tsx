import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClientPortal, sendClientMessage } from "@/data/clientPortal/store";
import { ClientPageHeading, ClientStatusBadge, EmptyState, formatDateTime } from "@/components/client-portal/primitives";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";

export const ClientAppointments = () => {
  const state = useClientPortal();
  const upcoming = state.appointments.filter((a) => a.status === "Scheduled" || a.status === "Requested");
  const past = state.appointments.filter((a) => a.status === "Completed" || a.status === "Cancelled");

  const Row = ({ a }: { a: (typeof state.appointments)[number] }) => (
    <Card>
      <CardContent className="flex flex-wrap items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{a.title}</p>
            <ClientStatusBadge label={a.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateTime(a.scheduledAt)} · {a.durationMinutes} minutes · {a.method}
            {a.location ? ` · ${a.location}` : ""}
          </p>
          {a.instructions && <p className="mt-2 text-sm text-muted-foreground">{a.instructions}</p>}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <ClientPageHeading
        title="Appointments"
        description="Your counselling sessions and meetings with your trustee."
        actions={
          <Button
            variant="outline"
            className="h-11"
            onClick={() => {
              sendClientMessage("I would like to request an appointment with my trustee.");
              toast.success("Request sent — your trustee's office will contact you.");
            }}
          >
            Request an appointment
          </Button>
        }
      />

      <div className="space-y-3">
        {upcoming.length === 0 ? (
          <EmptyState icon={<CalendarClock className="h-8 w-8" />} title="No upcoming appointments" />
        ) : (
          upcoming.map((a) => <Row key={a.id} a={a} />)
        )}
      </div>

      {past.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-lg font-semibold">Past appointments</h2>
          <div className="space-y-3">
            {past.map((a) => (
              <Row key={a.id} a={a} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ClientAppointments;
