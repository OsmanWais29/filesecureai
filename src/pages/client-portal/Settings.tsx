import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useClientPortal, disconnectBank, markNotificationsRead } from "@/data/clientPortal/store";
import { ClientPageHeading, ClientStatusBadge, formatDateTime } from "@/components/client-portal/primitives";
import { toast } from "sonner";

export const ClientSettings = () => {
  const state = useClientPortal();
  const connection = state.connections.find((c) => c.status === "connected");

  return (
    <div className="mx-auto max-w-3xl">
      <ClientPageHeading title="Settings" description="Your details, your privacy choices, and what you've shared." />

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your details</CardTitle>
            <CardDescription>To change these, message your trustee so your file stays accurate.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              {[
                ["Name", state.profile.name],
                ["Email", state.profile.email],
                ["Phone", state.profile.phone],
                ["Address", state.profile.address],
                ["Preferred contact", state.profile.preferredContact],
                ["Language", state.profile.language],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Privacy & sharing</CardTitle>
            <CardDescription>You decide what your trustee can access, and you can change it at any time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {state.consents.length === 0 && <p className="text-muted-foreground">You haven't shared banking information.</p>}
            {state.consents.map((c) => (
              <div key={c.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Banking information</p>
                  <ClientStatusBadge label={c.revokedAt ? "Withdrawn" : "Active"} />
                </div>
                <p className="mt-1 text-muted-foreground">{c.purposeText}</p>
                <p className="mt-2 text-xs text-muted-foreground">Granted {formatDateTime(c.grantedAt)}</p>
              </div>
            ))}
            {connection && (
              <>
                <Separator />
                <Button
                  variant="outline"
                  className="h-11"
                  onClick={() => {
                    disconnectBank(connection.id);
                    toast.success("Sharing stopped and your bank account was disconnected.");
                  }}
                >
                  Stop sharing and disconnect my bank
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {state.notifications.length === 0 ? (
              <p className="text-muted-foreground">No notifications.</p>
            ) : (
              <>
                <ul className="space-y-2">
                  {state.notifications.slice(0, 8).map((n) => (
                    <li key={n.id} className="rounded-md border px-3 py-2">
                      <p className="font-medium">{n.title}</p>
                      <p className="text-muted-foreground">{n.body}</p>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="h-11" onClick={markNotificationsRead}>
                  Mark all as read
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientSettings;
