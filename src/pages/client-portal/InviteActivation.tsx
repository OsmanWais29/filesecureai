import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import {
  markInvitationOpened,
  redeemInvitation,
  resolveInvitation,
  startPreviewSession,
  type InvitationPreview,
  type InvitationResolution,
} from "@/data/clientPortal/invitations";
import { setWelcomePending } from "@/data/clientPortal/store";
import { supabase } from "@/integrations/supabase/client";

/**
 * Public invitation + activation route: /client-portal/invite/:token
 *
 * The token is opaque and resolved server-side. The client is never asked for an
 * estate number, file number, proceeding type or any other insolvency metadata —
 * the invitation already carries that relationship.
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
  used: "This invitation has already been used. Sign in to your portal instead.",
  email_mismatch: "You are signed in with a different email address than the one that was invited.",
  unauthenticated: "Please create your account or sign in first.",
};

const InviteActivation = () => {
  const { token = "" } = useParams();
  const navigate = useNavigate();

  const [resolution, setResolution] = useState<InvitationResolution | null>(null);
  const [mode, setMode] = useState<"create" | "signin">("create");
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreePortal, setAgreePortal] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

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

  if (!resolution.ok) {
    return (
      <Shell>
        <h1 className="text-xl font-semibold">Invitation unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{FAILURE_COPY[resolution.reason]}</p>
        <Button className="mt-6 w-full" variant="outline" onClick={() => navigate("/client-login")}>
          Go to client sign in
        </Button>
      </Shell>
    );
  }

  const inv: InvitationPreview = resolution.invitation;
  const firstName = (inv.invitedName || inv.invitedEmail).split(" ")[0];

  const finish = async (estateId: string) => {
    setWelcomePending();
    toast.success("Your portal is ready.");
    navigate("/client-portal", { replace: true });
  };

  const submit = async () => {
    setBusy(true);
    setProblem(null);
    try {
      if (mode === "create") {
        const { error } = await supabase.auth.signUp({
          email: inv.invitedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/client-portal`,
            data: { user_type: "client", full_name: fullName },
          },
        });
        if (error && !/already registered|already exists/i.test(error.message)) throw error;
      }

      // Establish a session (covers both fresh sign-ups with auto-confirm and existing accounts).
      const signIn = await supabase.auth.signInWithPassword({ email: inv.invitedEmail, password });
      if (signIn.error || !signIn.data.session) {
        setProblem(
          mode === "create"
            ? "We could not sign you in automatically. If you already have an account, choose “Sign in to accept” and use your existing password."
            : "That password did not work. Please try again or reset your password.",
        );
        setBusy(false);
        return;
      }

      const redeemed = await redeemInvitation(token);
      if (!redeemed.ok) {
        setProblem(FAILURE_COPY[redeemed.reason] ?? FAILURE_COPY.invalid);
        setBusy(false);
        return;
      }

      startPreviewSession({
        invitationId: inv.invitationId,
        email: inv.invitedEmail,
        estateId: redeemed.estateId,
        activatedAt: new Date().toISOString(),
      });
      await finish(redeemed.estateId);
    } catch (e) {
      setProblem("Something went wrong activating your portal. Please try again or contact your trustee.");
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
            {mode === "create" ? "Create your account" : "Sign in to accept your invitation"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "create"
              ? "Just a name and a password — nothing else is needed."
              : "Use the password for your existing portal account."}
          </p>

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

            {mode === "create" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className="h-11"
                />
              </div>
            )}
          </div>

          <Button
            className="mt-6 w-full"
            size="lg"
            onClick={() => {
              if (mode === "create") {
                if (!fullName.trim()) return toast.error("Please enter your name.");
                if (password.length < 8) return toast.error("Use at least 8 characters.");
                if (password !== confirm) return toast.error("Passwords do not match.");
              } else if (!password) {
                return toast.error("Enter your password.");
              }
              setStep(2);
            }}
          >
            Continue
          </Button>

          <button
            type="button"
            className="mt-4 w-full text-sm text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => setMode(mode === "create" ? "signin" : "create")}
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
          <Button
            className="mt-6 w-full"
            size="lg"
            disabled={!agreePortal || !agreePrivacy}
            onClick={() => setStep(3)}
          >
            Continue
          </Button>
        </>
      )}

      {step === 3 && (
        <>
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          <h1 className="mt-3 text-xl font-semibold">Your portal is ready</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything your trustee has shared with you is already waiting inside.
          </p>
          {problem && (
            <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {problem}
            </p>
          )}
          <Button className="mt-6 w-full" size="lg" disabled={busy} onClick={submit}>
            {busy ? "Activating…" : "Enter my portal"}
          </Button>
          {problem && (
            <Button className="mt-2 w-full" variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
          )}
        </>
      )}
    </Shell>
  );
};

export default InviteActivation;
