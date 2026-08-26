import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import {
  createPortalAccount,
  markInvitationOpened,
  redeemInvitation,
  resolveInvitation,
  type InvitationPreview,
  type InvitationResolution,
} from "@/data/clientPortal/invitations";
import { supabase } from "@/integrations/supabase/client";

/**
 * Public invitation + activation route: /client-portal/invite/:token
 *
 * The token is opaque, lives only in the URL (never localStorage) and is
 * resolved server-side. New accounts are created by the
 * `create-client-portal-account` edge function with service-role access and
 * `email_confirm: true` — possession of the invitation link is the proof of
 * mailbox control, so no Supabase confirmation email is involved on this path.
 * Activation only reports success once a session exists,
 * `redeem_client_portal_invitation` succeeded, and an active
 * `client_portal_access` row can be read back for the signed-in user.
 */
const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
    <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">{children}</div>
  </div>
);

const FAILURE_COPY: Record<string, string> = {
  invalid: "This invitation link is not valid. Please use the most recent link your trustee sent you.",
  expired: "This invitation has expired. Contact your trustee to request a new invitation.",
  revoked: "This invitation is no longer active. Contact your trustee if you still need access.",
  suspended: "Access to this portal is currently paused. Please contact your trustee.",
  used: "This invitation has already been used by another account. Contact your trustee for a new invitation.",
  email_mismatch: "You are signed in with a different email address than the one that was invited.",
  unauthenticated: "Please create your account or sign in first.",
  rate_limited: "Too many attempts from this device. Please wait a few minutes and try again.",
  server_error: "We couldn't set up your account just now. Please try again in a moment.",
};

const devLog = (stage: string, err: unknown) => {
  if (import.meta.env.DEV) {
    const e = err as { code?: string; status?: number; message?: string } | null;
    // eslint-disable-next-line no-console
    console.error(`[invite-activation] ${stage} failed`, { code: e?.code, status: e?.status, message: e?.message });
  }
};

const safeAuthMessage = (message?: string) => {
  const m = (message ?? "").toLowerCase();
  if (m.includes("invalid login credentials")) return "That password did not work. Please try again.";
  if (m.includes("password")) return "That password does not meet the requirements. Use at least 8 characters.";
  return null;
};

const InviteActivation = () => {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [resolution, setResolution] = useState<InvitationResolution | null>(null);
  const [mode, setMode] = useState<"create" | "signin">("create");
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreePortal, setAgreePortal] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<{ message: string; action: "retry" | "signin" | "contact" } | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const r = await resolveInvitation(token);
      if (cancelled) return;
      setResolution(r);
      if (r.ok) {
        setFullName(r.invitation.invitedName);
        void markInvitationOpened(token);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  /**
   * Redeem + verify access for the currently authenticated user.
   * Returns true only when active portal access is readable afterwards.
   */
  const attachAndEnter = useCallback(async (): Promise<boolean> => {
    const redeemed = await redeemInvitation(token);
    if (redeemed.ok !== true) {
      const reason = (redeemed as { reason: string }).reason;
      devLog("redeem", { message: reason });
      setProblem({
        message: FAILURE_COPY[reason] ?? FAILURE_COPY.invalid,
        action: reason === "used" || reason === "email_mismatch" ? "contact" : "retry",
      });
      return false;
    }

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      setProblem({ message: "Your session expired. Please sign in to finish connecting your account.", action: "signin" });
      return false;
    }

    const { data: access, error } = await supabase
      .from("client_portal_access")
      .select("estate_id")
      .eq("user_id", auth.user.id)
      .eq("estate_id", redeemed.estateId)
      .eq("status", "active")
      .maybeSingle();

    if (error || !access) {
      devLog("access", error);
      setProblem({ message: "We couldn't confirm your access to this file. Please try again in a moment.", action: "retry" });
      return false;
    }

    await queryClient.invalidateQueries({ queryKey: ["portal-session"] });
    setDone(true);
    toast.success("Your secure portal is ready.");
    navigate("/client-portal", { replace: true, state: { justActivated: true } });
    return true;
  }, [navigate, queryClient, token]);

  if (!resolution) {
    return (
      <Shell>
        <div className="flex flex-col items-center py-6">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-sm text-muted-foreground">Checking your invitation…</p>
        </div>
      </Shell>
    );
  }

  if (resolution.ok !== true) {
    const reason = (resolution as { reason: string }).reason;
    return (
      <Shell>
        <h1 className="text-xl font-semibold">Invitation unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{FAILURE_COPY[reason] ?? FAILURE_COPY.invalid}</p>
        <Button className="mt-6 w-full" variant="outline" onClick={() => navigate("/client-login")}>
          Go to client sign in
        </Button>
      </Shell>
    );
  }

  const inv: InvitationPreview = resolution.invitation;
  const firstName = (inv.invitedName || inv.invitedEmail).split(" ")[0];

  const submit = async () => {
    setBusy(true);
    setProblem(null);
    try {
      if (mode === "create") {
        const created = await createPortalAccount({ token, fullName, password });

        if (created.ok !== true) {
          devLog("create-account", { message: created.reason });
          setProblem({
            message: FAILURE_COPY[created.reason] ?? FAILURE_COPY.invalid,
            action: created.reason === "used" ? "contact" : "retry",
          });
          return;
        }

        if (created.status === "existing_account") {
          setMode("signin");
          setPassword("");
          setStep(1);
          setProblem({
            message:
              "You already have a SecureFiles client account for this email. Sign in to connect this file.",
            action: "signin",
          });
          return;
        }
      }

      // Both paths finish with a normal browser password sign-in.
      const signIn = await supabase.auth.signInWithPassword({ email: inv.invitedEmail, password });
      if (signIn.error || !signIn.data.session) {
        devLog("signin", signIn.error);
        setProblem({
          message: safeAuthMessage(signIn.error?.message) ?? "We couldn't sign you in. Please check your password.",
          action: "retry",
        });
        return;
      }

      await attachAndEnter();
    } catch (e) {
      devLog("account", e);
      setProblem({ message: "We couldn't finish connecting your account. Please try again.", action: "retry" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell>
      <div className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <ShieldCheck className="h-4 w-4" /> {inv.firmName}
      </div>

      {step === 0 && (
        <>
          <h1 className="text-2xl font-semibold">You've been invited to your secure client portal.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Hi {firstName} — your portal is already connected to your file. You do not need a file number or any other
            paperwork details.
          </p>
          <div className="mt-4 rounded-md border px-3 py-2 text-sm">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Invitation sent to</div>
            <div className="font-medium">{inv.invitedEmail}</div>
          </div>
          <Button className="mt-6 w-full" size="lg" onClick={() => setStep(1)}>
            Continue
          </Button>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="text-xl font-semibold">
            {mode === "create" ? "Create your account" : "Sign in to accept invitation"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "create"
              ? "Just a name and a password — nothing else is needed."
              : "Use the password for your existing portal account."}
          </p>

          {problem && (
            <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {problem.message}
            </p>
          )}

          <div className="mt-5 space-y-4">
            {mode === "create" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  className="h-11"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={inv.invitedEmail} readOnly disabled className="h-11" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "create" ? "new-password" : "current-password"}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === "create" && <p className="text-xs text-muted-foreground">At least 8 characters.</p>}
            </div>
          </div>

          <Button
            className="mt-6 w-full"
            size="lg"
            onClick={() => {
              if (mode === "create") {
                if (fullName.trim().length < 2) return toast.error("Please enter your name.");
                if (password.length < 8) return toast.error("Use at least 8 characters.");
              } else if (!password) {
                return toast.error("Enter your password.");
              }
              setProblem(null);
              setStep(2);
            }}
          >
            Continue
          </Button>

          <button
            type="button"
            className="mt-4 w-full text-sm text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => {
              setProblem(null);
              setPassword("");
              setMode(mode === "create" ? "signin" : "create");
            }}
          >
            {mode === "create" ? "I already have an account — sign in to accept" : "I need to create an account"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="text-xl font-semibold">Before you continue</h1>
          <div className="mt-4 space-y-3 text-sm">
            <label className="flex items-start gap-2">
              <Checkbox checked={agreePortal} onCheckedChange={(v) => setAgreePortal(Boolean(v))} />
              <span>I agree to use this secure portal to communicate with my trustee.</span>
            </label>
            <label className="flex items-start gap-2">
              <Checkbox checked={agreePrivacy} onCheckedChange={(v) => setAgreePrivacy(Boolean(v))} />
              <span>I have read the privacy notice.</span>
            </label>
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Connecting a bank account and authorizing automatic payments are separate steps you approve later.
          </p>
          <Button className="mt-6 w-full" size="lg" disabled={!agreePortal || !agreePrivacy} onClick={() => setStep(3)}>
            Continue
          </Button>
        </>
      )}

      {step === 3 && (
        <>
          {done ? (
            <>
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              <h1 className="mt-3 text-xl font-semibold">Your secure portal is ready</h1>
              <p className="mt-2 text-sm text-muted-foreground">Taking you to your portal…</p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold">
                {busy ? "Setting up your secure portal…" : "Finish setting up your secure portal"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {busy
                  ? "This only takes a moment. Please don't close this window."
                  : "We'll connect your account to the file your trustee prepared for you."}
              </p>

              {problem && (
                <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-3 text-sm text-destructive">
                  <p className="font-medium">We couldn't finish connecting your account</p>
                  <p className="mt-1">{problem.message}</p>
                </div>
              )}

              {busy ? (
                <div className="mt-6 flex justify-center">
                  <LoadingSpinner size="large" />
                </div>
              ) : (
                <>
                  <Button className="mt-6 w-full" size="lg" onClick={submit}>
                    {mode === "create" ? "Create account and enter portal" : "Sign in and enter portal"}
                  </Button>
                  {problem?.action === "signin" && (
                    <Button
                      className="mt-2 w-full"
                      variant="outline"
                      onClick={() => {
                        setMode("signin");
                        setPassword("");
                        setStep(1);
                      }}
                    >
                      Sign in to accept invitation
                    </Button>
                  )}
                  {problem?.action === "contact" && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Please contact your trustee's office for a new invitation.
                    </p>
                  )}
                  {problem && (
                    <Button className="mt-2 w-full" variant="ghost" onClick={() => setStep(1)}>
                      Back
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </Shell>
  );
};

export default InviteActivation;
