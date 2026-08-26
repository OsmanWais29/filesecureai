import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Ban,
  Building2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Landmark,
  Mail,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEstateRow } from "@/hooks/useEstateRecords";
import { rowToValues, derivedDebtorName } from "@/data/estateRecordMapping";
import {
  ClientPortalInvitation,
  EMAIL_DELIVERY_CONFIGURED,
  INVITATION_STATUS_LABEL,
  createInvitation,
  changeInvitationEmail,
  inviteUrl,
  mintedTokenFor,
  markInvitationSent,
  restorePortalAccess,
  revokeInvitation,
  suspendPortalAccess,
  useEstateInvitation,
  usePortalEvents,
} from "@/data/clientPortal/invitations";
import {
  bindPortalToEstate,
  useClientPortal,
} from "@/data/clientPortal/store";
import {
  useReviewStaffRequest,
  useStaffMessage,
  useStaffRequests,
} from "@/data/clientPortal/staff";
import { PortalSubmissionsReview } from "./PortalSubmissionsReview";
import { ClientRequestComposer } from "./ClientRequestComposer";


const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

const Stat = ({ label, value, tone }: { label: string; value: string; tone?: "warn" | "ok" | "bad" }) => (
  <div className="min-w-[9rem] flex-1 rounded-md border bg-card px-3 py-2">
    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
    <div
      className={cn(
        "mt-0.5 truncate text-sm font-medium",
        tone === "warn" && "text-amber-600",
        tone === "ok" && "text-emerald-600",
        tone === "bad" && "text-destructive",
      )}
    >
      {value}
    </div>
  </div>
);

const SectionShell = ({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="rounded-lg border bg-card">
    <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {action}
    </header>
    <div className="p-4">{children}</div>
  </section>
);

/* ------------------------------------------------------------ provisioning */

const ProvisioningDialog = ({
  open,
  onOpenChange,
  context,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  context: {
    estateId: string;
    clientName: string;
    email: string;
    proceedingLabel: string;
    trusteeName: string;
    officeName: string;
    firmName: string;
  };
  onCreated: (inv: ClientPortalInvitation) => void;
}) => {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState(context.email);
  const [created, setCreated] = useState<ClientPortalInvitation | null>(null);

  const close = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(0);
      setCreated(null);
    }, 200);
  };

  const [creating, setCreating] = useState(false);

  const create = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error("Enter a valid email address for the invitation.");
      return;
    }
    setCreating(true);
    try {
      const inv = await createInvitation({
        estateId: context.estateId,
        clientId: `client-${context.estateId}`,
        clientName: context.clientName,
        invitedEmail: email,
        firmName: context.firmName,
        officeName: context.officeName,
        proceedingLabel: context.proceedingLabel,
        trusteeName: context.trusteeName,
        createdByName: context.trusteeName || "Trustee staff",
      });
      setCreated(inv);
      onCreated(inv);
      setStep(3);
    } catch (e) {
      toast.error("Could not create the invitation. Confirm you have trustee permissions and try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : close())}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create client portal</DialogTitle>
          <DialogDescription>
            The invitation carries the estate context. The client is never asked for file identification.
          </DialogDescription>
        </DialogHeader>

        {step === 0 && (
          <div className="space-y-3 text-sm">
            <div className="rounded-md border">
              {[
                ["Client", context.clientName],
                ["Estate / proceeding", context.proceedingLabel],
                ["Assigned trustee", context.trusteeName],
                ["Office", context.officeName],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b px-3 py-2 last:border-b-0">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v || "—"}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Read-only. Confirm this is the correct file.</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-2">
            <Label>Invitation email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@example.com" />
            <p className="text-xs text-muted-foreground">
              Prefilled from the debtor record. Correct it here if needed — no other client information is required.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-md border p-3">
              <div className="mb-1.5 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> The client will be able to
              </div>
              <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                <li>Receive and complete trustee requests</li>
                <li>Upload and replace documents</li>
                <li>Complete monthly income &amp; expense information</li>
                <li>View items the trustee shares</li>
                <li>Send secure messages</li>
                <li>See appointments and counselling sessions</li>
                <li>Connect a bank account when requested</li>
                <li>Authorize pre-authorized debit when requested</li>
              </ul>
            </div>
            <div className="rounded-md border p-3">
              <div className="mb-1.5 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" /> Never exposed
              </div>
              <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                <li>Internal staff notes</li>
                <li>Compliance exception internals</li>
                <li>Private SAFA reasoning</li>
                <li>Internal conduct analysis</li>
                <li>Other creditors' confidential information</li>
              </ul>
            </div>
          </div>
        )}

        {step === 3 && created && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 rounded-md border border-emerald-600/30 bg-emerald-600/5 px-3 py-2 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Invitation created
            </div>
            <div className="rounded-md border">
              <div className="flex justify-between border-b px-3 py-2">
                <span className="text-muted-foreground">Invited email</span>
                <span className="font-medium">{created.invitedEmail}</span>
              </div>
              <div className="flex justify-between px-3 py-2">
                <span className="text-muted-foreground">Expires</span>
                <span className="font-medium">{fmt(created.expiresAt)}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Secure link</Label>
              <Input readOnly value={inviteUrl(created.tokenReference ?? "")} onFocus={(e) => e.currentTarget.select()} />
              <p className="text-xs text-muted-foreground">
                The link contains an opaque token only — no estate, client or email data.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step < 3 ? (
            <>
              <Button variant="outline" onClick={() => (step === 0 ? close() : setStep(step - 1))}>
                {step === 0 ? "Cancel" : "Back"}
              </Button>
              {step < 2 ? (
                <Button onClick={() => setStep(step + 1)}>Continue</Button>
              ) : (
                <Button onClick={create} disabled={creating}>
                  {creating ? "Creating…" : "Create secure invitation"}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard?.writeText(inviteUrl(created!.tokenReference ?? ""));
                  toast.success("Secure invitation link copied.");
                }}
              >
                <Copy className="mr-1.5 h-4 w-4" /> Copy link
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  markInvitationSent(created!.id, context.trusteeName || "Trustee staff", EMAIL_DELIVERY_CONFIGURED);
                  toast.message(
                    EMAIL_DELIVERY_CONFIGURED ? "Invitation emailed." : "Invitation prepared — email not configured",
                    { description: EMAIL_DELIVERY_CONFIGURED ? undefined : "Copy the secure link and send it yourself." },
                  );
                }}
              >
                <Send className="mr-1.5 h-4 w-4" /> Send invitation
              </Button>
              <Button onClick={close}>Done</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ------------------------------------------------------------ requests */

const REQUEST_TABS = [
  { id: "waiting", label: "Waiting on client" },
  { id: "review", label: "Awaiting review" },
  { id: "more", label: "More information needed" },
  { id: "done", label: "Completed" },
] as const;

const ClientRequestsWorkspace = ({
  estateId,
  staffName,
  onCompose,
}: {
  estateId: string;
  staffName: string;
  onCompose: () => void;
}) => {
  const { data: requests = [] } = useStaffRequests(estateId);
  const reviewRequest = useReviewStaffRequest();
  const staffMessage = useStaffMessage();
  const [tab, setTab] = useState<(typeof REQUEST_TABS)[number]["id"]>("waiting");

  const rows = requests.filter((r) => {
    if (tab === "waiting") return r.status === "Action Required" || r.status === "In Progress" || r.status === "Reopened";
    if (tab === "review") return r.status === "Submitted" || r.status === "Under Review";
    if (tab === "more") return r.status === "More Information Needed";
    return r.status === "Completed";
  });

  const counts = {
    waiting: requests.filter((r) => ["Action Required", "In Progress", "Reopened"].includes(r.status)).length,
    review: requests.filter((r) => ["Submitted", "Under Review"].includes(r.status)).length,
    more: requests.filter((r) => r.status === "More Information Needed").length,
    done: requests.filter((r) => r.status === "Completed").length,
  };

  const review = async (
    request: (typeof requests)[number],
    outcome: "Under Review" | "Completed" | "More Information Needed",
  ) => {
    try {
      await reviewRequest.mutateAsync({ request, outcome, staffName });
      toast.success(
        outcome === "Completed"
          ? "Request accepted."
          : outcome === "More Information Needed"
            ? "Returned to the client for more information."
            : "Marked under review.",
      );
    } catch (e) {
      toast.error("Review not saved", { description: (e as Error).message });
    }
  };

  return (
    <SectionShell
      title="Client requests"
      description="Everything the estate is waiting on, and everything the client has returned."
      action={
        <Button size="sm" onClick={onCompose}>
          <MessageSquare className="mr-1.5 h-4 w-4" /> Request from client
        </Button>
      }
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {REQUEST_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {t.label} ({counts[t.id]})
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No requests in this state.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-3 font-medium">Request</th>
                <th className="py-2 pr-3 font-medium">Type</th>
                <th className="py-2 pr-3 font-medium">Due</th>
                <th className="py-2 pr-3 font-medium">Client status</th>
                <th className="py-2 pr-3 font-medium">Review</th>
                <th className="py-2 pr-3 font-medium">Source</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-b-0 align-top">
                  <td className="py-2 pr-3">
                    <div className="font-medium">{r.title}</div>
                    {r.clientResponse && (
                      <div className="mt-0.5 max-w-md text-xs text-muted-foreground">{r.clientResponse}</div>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-xs text-muted-foreground">{r.requestType.replace(/_/g, " ")}</td>
                  <td className="py-2 pr-3 text-xs">{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—"}</td>
                  <td className="py-2 pr-3"><Badge variant="outline">{r.status}</Badge></td>
                  <td className="py-2 pr-3 text-xs text-muted-foreground">{r.trusteeReviewState}</td>
                  <td className="py-2 pr-3 text-xs text-muted-foreground">
                    {r.sourceSignalId ? "Compliance signal" : r.sourceDocumentId ? "Document" : "Manual"}
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {(r.status === "Submitted" || r.status === "Under Review") && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => void review(r, "Under Review")}>
                            Review
                          </Button>
                          <Button size="sm" onClick={() => void review(r, "Completed")}>
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => void review(r, "More Information Needed")}>
                            More info
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          try {
                            await staffMessage.mutateAsync({
                              estateId,
                              body: `Regarding "${r.title}" — your trustee has sent you a message.`,
                              staffName,
                              relatedRequestId: r.id,
                            });
                            toast.success("Message sent to the client.");
                          } catch (e) {
                            toast.error("Message not sent", { description: (e as Error).message });
                          }
                        }}
                      >
                        Message
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">Reviewer: {staffName}</p>
    </SectionShell>
  );
};


/* ------------------------------------------------------------ banking */

const BankingPayments = ({ onRequest }: { onRequest: (kind: "bank" | "pad") => void }) => {
  const portal = useClientPortal();
  const conn = portal.connections[0];
  const consent = portal.consents.find((c) => !c.revokedAt);
  const pad = portal.padAuthorizations[0];
  const nextPayment = portal.schedules[0]?.nextPaymentDate;

  return (
    <SectionShell title="Banking & payments" description="Client-side connection and mandate status. No credentials or full account numbers are stored.">
      <div className="flex flex-wrap gap-2">
        <Stat label="Connection" value={conn?.status === "connected" ? "Connected" : "Not connected"} tone={conn?.status === "connected" ? "ok" : "warn"} />
        <Stat label="Institution" value={conn?.institutionName ? `${conn.institutionName} ${conn.accountMask ?? ""}` : "—"} />
        <Stat label="Last sync" value={fmt(conn?.lastSyncedAt)} />
        <Stat label="Consent" value={consent ? "Active" : "Not granted"} tone={consent ? "ok" : "warn"} />
        <Stat
          label="PAD"
          value={pad ? (pad.status === "active" ? "Active" : pad.status.replace(/_/g, " ")) : "Not requested"}
          tone={pad?.status === "active" ? "ok" : "warn"}
        />
        <Stat label="Next payment" value={nextPayment ? new Date(nextPayment).toLocaleDateString() : "—"} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => onRequest("bank")}>
          <Landmark className="mr-1.5 h-4 w-4" /> Request bank connection
        </Button>
        <Button size="sm" variant="outline" onClick={() => onRequest("pad")}>
          Request PAD authorization
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link to="/client-portal/banking" target="_blank">
            View banking details <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </SectionShell>
  );
};

/* ------------------------------------------------------------ activity */

const ActivitySummary = ({ estateId }: { estateId: string }) => {
  const portalEvents = usePortalEvents(estateId);
  const merged = useMemo(
    () =>
      portalEvents
        .map((e) => ({ at: e.occurredAt, actor: e.actor, label: e.eventType.replace(/_/g, " ").toLowerCase(), detail: e.detail }))
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 12),
    [portalEvents],
  );


  return (
    <SectionShell title="Client activity" description="Portal and request activity, most recent first.">
      {merged.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No portal activity yet.</p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {merged.map((e, i) => (
            <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-1.5 last:border-b-0">
              <span>
                <span className="font-medium capitalize">{e.label}</span>
                {e.detail && <span className="text-muted-foreground"> — {e.detail}</span>}
              </span>
              <span className="text-xs text-muted-foreground">{e.actor} · {fmt(e.at)}</span>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
};

/* ------------------------------------------------------------ main panel */

export const ClientPortalPanel = ({ estateId }: { estateId?: string }) => {
  const { data: row } = useEstateRow(estateId);
  const invitation = useEstateInvitation(estateId);
  const portal = useClientPortal();
  const { data: staffRequests = [] } = useStaffRequests(estateId);
  const staffMessage = useStaffMessage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerDefaults, setComposerDefaults] = useState<Record<string, unknown> | undefined>();
  const [emailDraft, setEmailDraft] = useState("");

  const values = useMemo(() => rowToValues(row), [row]);
  const clientName = row ? derivedDebtorName(values) : "Client";
  const email = String(values.email ?? "").trim();
  const trusteeName = String(values.trustee ?? row?.trustee_name ?? "Trustee staff");
  const officeName = String(row?.trustee_office ?? "—");
  const proceedingLabel = String(row?.proceeding_type ?? row?.estate_type ?? "Insolvency proceeding");
  const firmName = "SecureFiles AI Trustee";

  if (!estateId) return null;

  const openRequests = staffRequests.filter((r) =>
    ["Action Required", "In Progress", "More Information Needed", "Reopened"].includes(r.status),
  ).length;
  const awaitingReview = staffRequests.filter((r) => ["Submitted", "Under Review"].includes(r.status)).length;

  const conn = portal.connections[0];
  const pad = portal.padAuthorizations[0];

  const requestFor = (kind: "bank" | "pad") => {
    setComposerDefaults(
      kind === "bank"
        ? {
            requestType: "connect_bank_account",
            title: "Connect your bank account",
            description:
              "Connecting your bank account lets us confirm your income securely. You never share your banking password with us.",
          }
        : {
            requestType: "authorize_pad",
            title: "Authorize your automatic payments",
            description: "Please review and authorize the pre-authorized debit for your monthly payment.",
          },
    );
    setComposerOpen(true);
  };

  const notCreated = !invitation;
  const mintedToken = invitation ? mintedTokenFor(invitation.id) : undefined;
  const link = mintedToken ? inviteUrl(mintedToken) : "";

  return (
    <div className="space-y-4">
      <SectionShell
        title="Client portal"
        description="Provision and manage the debtor's secure access from this estate."
        action={
          invitation ? (
            <Badge variant={invitation.status === "active" ? "default" : "outline"}>
              {INVITATION_STATUS_LABEL[invitation.status]}
            </Badge>
          ) : (
            <Badge variant="outline">Not created</Badge>
          )
        }
      >
        {notCreated ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Give this client secure access to documents, requests, income reporting, payments and messages without
              requiring them to know their estate information.
            </p>
            <div className="flex flex-wrap gap-2">
              <Stat label="Client" value={clientName} />
              <Stat label="Email" value={email || "Not recorded"} tone={email ? undefined : "warn"} />
              <Stat label="Trustee" value={trusteeName} />
              <Stat label="Office" value={officeName} />
            </div>
            {!email && (
              <div className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-sm text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                Email required before portal invitation can be created.
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setDialogOpen(true)}>
                <UserPlus className="mr-1.5 h-4 w-4" /> Create client portal
              </Button>
            </div>
            <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
              <li>Estate and client context are linked automatically</li>
              <li>The client only sees information intentionally made available to them</li>
              <li>Internal compliance notes, trustee-only exceptions and SAFA internal analysis remain hidden</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Stat label="Portal status" value={invitation.status === "active" ? "Active" : "Pending activation"} tone={invitation.status === "active" ? "ok" : "warn"} />
              <Stat label="Invitation" value={INVITATION_STATUS_LABEL[invitation.status]} />
              <Stat label="Client email" value={invitation.invitedEmail} />
              <Stat label="Last invite sent" value={fmt(invitation.lastSentAt)} />
              <Stat label="Expires" value={fmt(invitation.expiresAt)} />
              <Stat label="Last portal activity" value={fmt(invitation.lastActivityAt ?? invitation.acceptedAt)} />
              <Stat label="Open client requests" value={String(openRequests)} tone={openRequests ? "warn" : "ok"} />
              <Stat label="Awaiting trustee review" value={String(awaitingReview)} tone={awaitingReview ? "warn" : "ok"} />
              <Stat label="Bank connection" value={conn?.status === "connected" ? "Connected" : "Not connected"} />
              <Stat label="PAD" value={pad ? pad.status.replace(/_/g, " ") : "Not requested"} />
            </div>

            {!EMAIL_DELIVERY_CONFIGURED && (
              <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-700">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <strong>Preview — email not configured.</strong> Invitations are prepared but not delivered. Copy the
                  secure link and send it through your own channel. This invitation is recorded as simulated.
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Secure invitation link</Label>
              {link ? (
                <div className="flex gap-2">
                  <Input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs" />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard?.writeText(link);
                      toast.success("Secure invitation link copied.");
                    }}
                  >
                    <Copy className="mr-1.5 h-4 w-4" /> Copy link
                  </Button>
                </div>
              ) : (
                <p className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  The secure link is shown once, at creation. Only a one-way fingerprint is stored, so it cannot be
                  displayed again. Issue a new invitation if the client needs another link.
                </p>
              )}
            </div>

            {invitation.status !== "active" && invitation.status !== "revoked" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Change client email (before activation)</Label>
                <div className="flex gap-2">
                  <Input
                    value={emailDraft || invitation.invitedEmail}
                    onChange={(e) => setEmailDraft(e.target.value)}
                    placeholder="client@example.com"
                  />
                  <Button
                    variant="outline"
                    disabled={!emailDraft || emailDraft.trim().toLowerCase() === invitation.invitedEmail}
                    onClick={async () => {
                      await changeInvitationEmail(invitation.id, estateId, emailDraft, trusteeName);
                      toast.success("Invitation email updated. Send a new invitation to that address.");
                    }}
                  >
                    Update
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex flex-wrap gap-2">
              {(invitation.status === "created") && (
                <Button onClick={() => markInvitationSent(invitation.id, trusteeName, EMAIL_DELIVERY_CONFIGURED)}>
                  <Send className="mr-1.5 h-4 w-4" /> Send invitation
                </Button>
              )}
              {(invitation.status === "sent" || invitation.status === "opened" || invitation.status === "expired") && (
                <Button onClick={() => markInvitationSent(invitation.id, trusteeName, EMAIL_DELIVERY_CONFIGURED, true)}>
                  <RefreshCw className="mr-1.5 h-4 w-4" />
                  {invitation.status === "expired" ? "Create new link" : "Resend invitation"}
                </Button>
              )}
              {invitation.status === "active" && (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/client-portal" target="_blank">
                      <ExternalLink className="mr-1.5 h-4 w-4" /> Open client portal preview
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => { setComposerDefaults(undefined); setComposerOpen(true); }}>
                    Request from client
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await staffMessage.mutateAsync({
                          estateId,
                          body: "Your trustee has sent you a secure message.",
                          staffName: trusteeName,
                        });
                        toast.success("Secure message sent.");
                      } catch (e) {
                        toast.error("Message not sent", { description: (e as Error).message });
                      }
                    }}
                  >
                    Send secure message
                  </Button>

                </>
              )}
              {invitation.status === "suspended" ? (
                <Button variant="outline" onClick={() => restorePortalAccess(invitation.id, trusteeName, estateId)}>
                  Restore access
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => suspendPortalAccess(invitation.id, trusteeName, estateId)}>
                    Suspend portal access
                  </Button>
                  {invitation.status !== "revoked" && (
                    <Button variant="ghost" className="text-destructive" onClick={() => revokeInvitation(invitation.id, trusteeName, estateId)}>
                      <Ban className="mr-1.5 h-4 w-4" /> Revoke invitation
                    </Button>
                  )}
                </>
              )}
              {(invitation.status === "revoked" || invitation.status === "expired") && (
                <Button
                  onClick={() => {
                    bindPortalToEstate({
                      estateId,
                      clientId: `client-${estateId}`,
                      name: clientName,
                      email: invitation.invitedEmail,
                      firmName,
                      proceedingLabel,
                      trusteeName,
                    });
                    setDialogOpen(true);
                  }}
                >
                  Create new invitation
                </Button>
              )}
            </div>

            {invitation.status === "opened" && (
              <p className="text-xs text-muted-foreground">Waiting for account activation.</p>
            )}
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" /> Created by {invitation.createdByName} · {fmt(invitation.createdAt)}
            </p>
          </div>
        )}
      </SectionShell>

      {invitation && (
        <>
          <ClientRequestsWorkspace
            estateId={estateId}
            staffName={trusteeName}
            onCompose={() => {
              setComposerDefaults(undefined);
              setComposerOpen(true);
            }}
          />
          <PortalSubmissionsReview estateId={estateId} staffName={trusteeName} />
          <BankingPayments onRequest={requestFor} />
          <ActivitySummary estateId={estateId} />

        </>
      )}

      <ProvisioningDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        context={{ estateId, clientName, email, proceedingLabel, trusteeName, officeName, firmName }}
        onCreated={(inv) =>
          bindPortalToEstate({
            estateId,
            clientId: inv.clientId,
            name: clientName,
            email: inv.invitedEmail,
            phone: String(values.phone ?? ""),
            address: String(values.address ?? ""),
            firmName,
            proceedingLabel,
            trusteeName,
          })
        }
      />

      <ClientRequestComposer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        staffName={trusteeName}
        defaults={composerDefaults as never}
      />
    </div>
  );
};
