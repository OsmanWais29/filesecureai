import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  activateInvitation,
  markInvitationOpened,
  resolveInvitation,
  type InvitationResolution,
} from "@/data/clientPortal/invitations";
import { setWelcomePending } from "@/data/clientPortal/store";
import { supabase } from "@/lib/supabase";

/**
 * Public invitation + activation route: /client-portal/invite/:token
 *
 * The token is opaque. Nothing about the estate is displayed before the invited
 * email is confirmed beyond safe firm context and the client's first name.
 */
const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
    <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">{children}</div>
  </div>
);

const InviteActivation = () => {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const resolution = useMemo<InvitationResolution>(() => resolveInvitation(token), [token]);
  const [step, setStep] = useState(0);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreePortal, setAgreePortal] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (resolution.ok) markInvitationOpened(resolution.invitation.id);
  }, [resolution]);

  if (resolution.ok !== true) {
    const reason = (resolution as { reason: string }).reason;
    const copy =
      ({
        invalid: "This invitation is not valid.",
        expired: "This invitation has expired. Contact your trustee or request a new invitation.",
        revoked: "This invitation is no longer active.",
        suspended: "Access to this portal is currently suspended. Please contact your trustee.",
      } as Record<string, string>)[reason] ?? "This invitation is not valid.";

    return (
      <Shell>
        <h1 className="text-xl font-semibold">Invitation unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
      </Shell>
    );
  }

  const inv = resolution.invitation;
  const firstName = inv.clientName.split(" ")[0];

  const activate = async () => {
    setBusy(true);
    let userId: string | undefined;
    let realAuth = false;
    try {
      const { data, error } = await supabase.auth.signUp({
        email: inv.invitedEmail,
        password,
        options: { data: { user_type: "client", full_name: inv.clientName } },
      });
      if (!error && data.user) {
        userId = data.user.id;
        realAuth = Boolean(data.session);
      }
      if (!realAuth) {
        const signIn = await supabase.auth.signInWithPassword({ email: inv.invitedEmail, password });
        if (!signIn.error && signIn.data.session) {
          userId = signIn.data.user?.id;
          realAuth = true;
        }
      }
    } catch {
      /* falls back to preview activation */
    }
    activateInvitation(inv.id, userId, !realAuth);
    setWelcomePending();
    setBusy(false);
    toast.success("Your portal is ready.");
    navigate("/client-portal", { replace: true });
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
            Hi {firstName} — your portal has already been connected to your file. You do not need an estate number or
            file number.
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
          <h1 className="text-xl font-semibold">Confirm your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">This is the address your trustee invited.</p>
          <div className="mt-4 space-y-1.5">
            <Label>Email</Label>
            <Input value={inv.invitedEmail} readOnly disabled />
          </div>
          <Button className="mt-6 w-full" size="lg" onClick={() => setStep(2)}>
            This is my email
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="text-xl font-semibold">Create your password</h1>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm password</Label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
          </div>
          <Button
            className="mt-6 w-full"
            size="lg"
            onClick={() => {
              if (password.length < 8) return toast.error("Use at least 8 characters.");
              if (password !== confirm) return toast.error("Passwords do not match.");
              setStep(3);
            }}
          >
            Continue
          </Button>
        </>
      )}

      {step === 3 && (
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
            disabled={!agreePortal || !agreePrivacy || busy}
            onClick={() => setStep(4)}
          >
            Continue
          </Button>
        </>
      )}

      {step === 4 && (
        <>
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          <h1 className="mt-3 text-xl font-semibold">Your portal is ready</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything your trustee has shared with you is already waiting inside.
          </p>
          <Button className="mt-6 w-full" size="lg" disabled={busy} onClick={activate}>
            {busy ? "Activating…" : "Enter my portal"}
          </Button>
        </>
      )}
    </Shell>
  );
};

export default InviteActivation;
