import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ClientPageHeading,
  ClientStatusBadge,
  EmptyState,
  SimulationNotice,
  formatDate,
  formatDateTime,
  formatMoney,
} from "@/components/client-portal/primitives";
import {
  useClientPortal,
  grantBankConsent,
  upsertBankConnection,
  addBankImport,
  disconnectBank,
  authorizePad,
  revokePad,
  requestScheduleChange,
  recordEvent,
  addClientDocument,
} from "@/data/clientPortal/store";
import { launchBankConnection, syncTransactions, zumRailsMode, providerStatementsSupported } from "@/services/banking/zumRails";
import { toast } from "sonner";
import { Landmark, Lock, RefreshCw, ShieldCheck, Loader2, Upload } from "lucide-react";

const CONSENT_PURPOSE =
  "Share my account details, balances and transaction history with my Licensed Insolvency Trustee so they can verify my income and administer my file.";

const PAD_TERMS_VERSION = "PAD-2026.1";

export const ClientBanking = () => {
  const state = useClientPortal();
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [scopes, setScopes] = useState({ account_details: true, balances: true, transactions: true, statements: false });
  const [padOpen, setPadOpen] = useState<string | null>(null);
  const [padAgreed, setPadAgreed] = useState(false);
  const [changeOpen, setChangeOpen] = useState<string | null>(null);
  const [changeText, setChangeText] = useState("");

  const connection = state.connections.find((c) => c.status === "connected");
  const simulated = zumRailsMode() === "simulation";

  const handleConnect = async () => {
    setConsentOpen(false);
    setConnecting(true);
    try {
      const selected = (Object.keys(scopes) as (keyof typeof scopes)[]).filter((k) => scopes[k]);
      const consent = grantBankConsent({
        scopes: selected as never,
        grantedBy: state.profile.name,
        purposeText: CONSENT_PURPOSE,
      });
      const result = await launchBankConnection({
        estateId: state.profile.estateId,
        clientId: state.profile.id,
        consentId: consent.id,
      });
      upsertBankConnection({
        id: `conn-${result.externalConnectionId}`,
        estateId: state.profile.estateId,
        clientId: state.profile.id,
        provider: "zum_rails",
        externalConnectionId: result.externalConnectionId,
        status: "connected",
        institutionName: result.institutionName,
        accountMask: result.accountMask,
        accountType: result.accountType,
        sourceAccountRef: result.sourceAccountRef,
        connectedAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
        health: "healthy",
        consentId: consent.id,
        simulated: result.simulated,
      });
      recordEvent("CLIENT_BANK_CONNECTED", { actor: state.profile.name, actorRole: "client", detail: result.institutionName });
      toast.success("Bank account connected");
    } catch (e) {
      toast.error("We couldn't complete the connection", { description: e instanceof Error ? e.message : undefined });
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    if (!connection) return;
    setSyncing(true);
    try {
      const { imp, transactions } = await syncTransactions(connection);
      addBankImport(imp, transactions);
      upsertBankConnection({ ...connection, lastSyncedAt: new Date().toISOString() });
      recordEvent("CLIENT_BANK_SYNCED", { actor: state.profile.name, actorRole: "client", detail: `${transactions.length} transactions` });
      toast.success("Bank information refreshed");
    } catch (e) {
      toast.error("Refresh failed", { description: e instanceof Error ? e.message : undefined });
    } finally {
      setSyncing(false);
    }
  };

  const handleStatementUpload = (files: FileList | null) => {
    if (!files?.length) return;
    Array.from(files).forEach((f) =>
      addClientDocument({
        title: f.name,
        category: "Bank statement",
        source: "CLIENT_UPLOAD",
        state: "Under review",
        uploadedAt: new Date().toISOString(),
        uploadedBy: "You",
        sharedWithClient: true,
        downloadable: true,
      }),
    );
    toast.success("Statement uploaded to your trustee");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <ClientPageHeading
        title="Banking & payments"
        description="Connect your bank securely, set up your payments, and see exactly what is shared with your trustee."
      />

      <Tabs defaultValue="connection">
        <TabsList>
          <TabsTrigger value="connection">Bank connection</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="activity">Shared information</TabsTrigger>
        </TabsList>

        {/* ------------------------------------------------ bank connection */}
        <TabsContent value="connection" className="mt-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Landmark className="h-4 w-4 text-muted-foreground" /> Your bank account
              </CardTitle>
              <CardDescription>
                Connections are handled by Zūm Rails, a regulated Canadian payments provider. You sign in with your bank
                directly — SecureFiles never sees or stores your banking username or password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connection ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4">
                    <div>
                      <p className="font-medium">
                        {connection.institutionName} · {connection.accountType} {connection.accountMask}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Connected {formatDate(connection.connectedAt)} · last refreshed {formatDateTime(connection.lastSyncedAt)}
                      </p>
                    </div>
                    <ClientStatusBadge label={connection.health === "healthy" ? "Active" : "Needs attention"} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="h-11" onClick={() => void handleSync()} disabled={syncing}>
                      {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                      Refresh information
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11"
                      onClick={() => {
                        disconnectBank(connection.id);
                        toast.success("Bank account disconnected", {
                          description: "Sharing has stopped and any automatic payments are paused.",
                        });
                      }}
                    >
                      Disconnect
                    </Button>
                  </div>

                  {connection.simulated && (
                    <SimulationNotice>
                      Demonstration connection. No real financial institution has been contacted and no live banking data
                      is shown.
                    </SimulationNotice>
                  )}
                </>
              ) : (
                <>
                  <EmptyState
                    icon={<Landmark className="h-8 w-8" />}
                    title="No bank account connected"
                    body="Connecting your account saves you from gathering statements every month."
                  />
                  <Button className="h-11 w-full" onClick={() => setConsentOpen(true)} disabled={connecting}>
                    {connecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                    Connect my bank account
                  </Button>
                  {simulated && (
                    <SimulationNotice>
                      Zūm Rails credentials are not configured in this environment, so the connection flow runs in
                      demonstration mode.
                    </SimulationNotice>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bank statements</CardTitle>
              <CardDescription>
                {providerStatementsSupported()
                  ? "Statements are retrieved automatically from your connected account."
                  : "Statement PDFs cannot be retrieved automatically from your bank, so please upload them when asked."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/20 px-4 py-6 text-sm font-medium">
                <Upload className="h-4 w-4" /> Upload a bank statement
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => handleStatementUpload(e.target.files)}
                />
              </label>
              {state.statements.length > 0 && (
                <ul className="space-y-2 text-sm">
                  {state.statements.map((s) => (
                    <li key={s.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <span>
                        {s.institutionName} {s.accountMask} · {formatDate(s.periodStart)} – {formatDate(s.periodEnd)}
                      </span>
                      <ClientStatusBadge label={s.source === "CLIENT_UPLOAD" ? "Uploaded by you" : "From your bank"} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------------------------------------------- payments */}
        <TabsContent value="payments" className="mt-5 space-y-4">
          {state.schedules.length === 0 ? (
            <EmptyState title="No payment arrangement yet" body="Your trustee will set this up and it will appear here." />
          ) : (
            state.schedules.map((s) => {
              const pad = state.padAuthorizations.find((p) => p.estateScheduleId === s.id);
              return (
                <Card key={s.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-base">{s.purpose}</CardTitle>
                      <ClientStatusBadge label={s.status} />
                    </div>
                    <CardDescription>
                      {formatMoney(s.amount)} {s.frequency.toLowerCase()} · {s.method}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div>
                        <dt className="text-xs uppercase text-muted-foreground">Next payment</dt>
                        <dd className="font-medium">{formatDate(s.nextPaymentDate)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase text-muted-foreground">Paid to date</dt>
                        <dd className="font-medium">{formatMoney(s.paidToDate)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase text-muted-foreground">Outstanding</dt>
                        <dd className="font-medium">{formatMoney(s.outstandingToDate)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase text-muted-foreground">Started</dt>
                        <dd className="font-medium">{formatDate(s.startDate)}</dd>
                      </div>
                    </dl>

                    <Separator />

                    {pad && pad.status === "active" ? (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-muted-foreground">
                          Automatic payments are authorized from {connection?.accountMask ?? "your connected account"}.
                        </p>
                        <Button
                          variant="outline"
                          className="h-11"
                          onClick={() => {
                            revokePad(pad.id);
                            toast.success("Automatic payments cancelled", {
                              description: "Your trustee has been notified and will contact you about next steps.",
                            });
                          }}
                        >
                          Cancel automatic payments
                        </Button>
                      </div>
                    ) : pad ? (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-muted-foreground">
                          {connection
                            ? "Authorize automatic payments so you never miss a due date."
                            : "Connect your bank account first, then you can authorize automatic payments."}
                        </p>
                        <Button
                          className="h-11"
                          disabled={!connection}
                          onClick={() => {
                            setPadAgreed(false);
                            setPadOpen(pad.id);
                          }}
                        >
                          <Lock className="mr-2 h-4 w-4" /> Authorize automatic payments
                        </Button>
                      </div>
                    ) : null}

                    <Button
                      variant="ghost"
                      className="h-11 px-0 text-primary"
                      onClick={() => {
                        setChangeText("");
                        setChangeOpen(s.id);
                      }}
                    >
                      Request a change to this arrangement
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Payment amounts and dates are set by your trustee. Requesting a change sends a message for them to
                      review — nothing changes automatically.
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment history</CardTitle>
            </CardHeader>
            <CardContent>
              {state.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{formatDate(p.date)}</TableCell>
                        <TableCell>{formatMoney(p.amount)}</TableCell>
                        <TableCell>{p.method}</TableCell>
                        <TableCell className="text-right">
                          <ClientStatusBadge label={p.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------------------------------ shared / activity */}
        <TabsContent value="activity" className="mt-5 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">What you've shared</CardTitle>
              <CardDescription>
                You control this. Disconnecting your bank stops all future sharing immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {state.consents.length === 0 ? (
                <p className="text-muted-foreground">You haven't shared any banking information yet.</p>
              ) : (
                state.consents.map((c) => (
                  <div key={c.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Banking consent</p>
                      <ClientStatusBadge label={c.revokedAt ? "Withdrawn" : "Active"} />
                    </div>
                    <p className="mt-1 text-muted-foreground">{c.purposeText}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Granted {formatDateTime(c.grantedAt)} · Shared: {c.scopes.join(", ")}
                      {c.revokedAt ? ` · Withdrawn ${formatDateTime(c.revokedAt)}` : ""}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent transactions shared with your trustee</CardTitle>
              <CardDescription>
                These are used as evidence of your income and expenses. They are not payments to your estate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No transaction information has been shared.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.transactions.slice(0, 25).map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{formatDate(t.postedAt)}</TableCell>
                        <TableCell>{t.description}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {t.direction === "debit" ? "−" : "+"}
                          {formatMoney(t.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ---------------------------------------------------- consent dialog */}
      <Dialog open={consentOpen} onOpenChange={setConsentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Before you connect</DialogTitle>
            <DialogDescription>
              You'll sign in to your bank through Zūm Rails' secure page. SecureFiles never receives your banking login.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="font-medium">Choose what to share with {state.profile.trusteeName}:</p>
            {(
              [
                ["account_details", "Account name, type and last four digits"],
                ["balances", "Account balances"],
                ["transactions", "Transaction history (used to verify income and expenses)"],
                ["statements", "Statements, where your bank makes them available"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-start gap-3">
                <Checkbox
                  id={key}
                  checked={scopes[key]}
                  onCheckedChange={(v) => setScopes((s) => ({ ...s, [key]: !!v }))}
                />
                <Label htmlFor={key} className="text-sm font-normal leading-snug">
                  {label}
                </Label>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              You can withdraw this at any time by disconnecting your account. Withdrawing does not delete information
              already provided to your trustee.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-11" onClick={() => setConsentOpen(false)}>
              Cancel
            </Button>
            <Button className="h-11" onClick={() => void handleConnect()}>
              I agree — continue to my bank
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -------------------------------------------------------- PAD dialog */}
      <Dialog open={!!padOpen} onOpenChange={(v) => !v && setPadOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authorize automatic payments</DialogTitle>
            <DialogDescription>
              Pre-authorized debit agreement {PAD_TERMS_VERSION}. Your trustee sets the amount and dates; you are
              authorizing the withdrawals only.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p>
                Account: <span className="font-medium">{connection?.institutionName} {connection?.accountMask}</span>
              </p>
              {(() => {
                const pad = state.padAuthorizations.find((p) => p.id === padOpen);
                const sch = state.schedules.find((s) => s.id === pad?.estateScheduleId);
                return sch ? (
                  <p className="mt-1">
                    Amount: <span className="font-medium">{formatMoney(sch.amount)} {sch.frequency.toLowerCase()}</span>, starting{" "}
                    {formatDate(sch.nextPaymentDate ?? sch.startDate)}
                  </p>
                ) : null;
              })()}
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id="pad-agree" checked={padAgreed} onCheckedChange={(v) => setPadAgreed(!!v)} />
              <Label htmlFor="pad-agree" className="text-sm font-normal leading-snug">
                I authorize these pre-authorized debits from the account shown above, and I understand I may cancel this
                authorization at any time in this portal.
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-11" onClick={() => setPadOpen(null)}>
              Not now
            </Button>
            <Button
              className="h-11"
              disabled={!padAgreed || !connection}
              onClick={() => {
                if (padOpen && connection) authorizePad(padOpen, connection.id);
                setPadOpen(null);
                toast.success("Automatic payments authorized");
              }}
            >
              Authorize
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------------------------------------------- change request */}
      <Dialog open={!!changeOpen} onOpenChange={(v) => !v && setChangeOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a change</DialogTitle>
            <DialogDescription>
              Tell your trustee what you need. They'll review it and get back to you — your current arrangement stays in
              place until then.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={5}
            value={changeText}
            onChange={(e) => setChangeText(e.target.value)}
            placeholder="For example: my hours were reduced and I need a lower monthly amount."
          />
          <DialogFooter>
            <Button variant="outline" className="h-11" onClick={() => setChangeOpen(null)}>
              Cancel
            </Button>
            <Button
              className="h-11"
              disabled={!changeText.trim()}
              onClick={() => {
                if (changeOpen) requestScheduleChange(changeOpen, changeText.trim());
                setChangeOpen(null);
                toast.success("Sent to your trustee");
              }}
            >
              Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientBanking;
