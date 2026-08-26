import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { recordPortalLogin } from "@/data/clientPortal/invitations";

interface ClientPortalFormProps {
  onConfirmationSent: (email: string) => void;
  onSwitchToTrusteePortal: () => void;
}

/**
 * Client portal entry. Deliberately minimal: a client never supplies estate
 * numbers, proceeding types, trustee names or any other insolvency metadata.
 * Access to a file comes exclusively from the trustee's secure invitation.
 */
export const ClientPortalForm = ({ onConfirmationSent, onSwitchToTrusteePortal }: ClientPortalFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setError(null), [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (isSignUp && !fullName.trim()) return setError('Please enter your full name.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError('Please enter a valid email address.');
    if (password.length < 8) return setError('Your password must be at least 8 characters.');

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/client-portal`,
            data: { user_type: 'client', full_name: fullName.trim() },
          },
        });
        if (signUpError) throw signUpError;

        if (!data.session) {
          onConfirmationSent(email);
          toast({ title: 'Check your email', description: 'Confirm your address to finish creating your account.' });
        } else {
          navigate('/client-portal', { replace: true });
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        // Deliberately generic: never reveal whether an account exists.
        if (signInError) {
          setError('We could not sign you in with those details. Please check your email and password.');
          setLoading(false);
          return;
        }
        await recordPortalLogin();
        toast({ title: 'Welcome back', description: 'You are signed in to your secure portal.' });
        navigate('/client-portal', { replace: true });
      }
    } catch {
      setError('Something went wrong. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-7 rounded-2xl border border-blue-200/50 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
          <Lock className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Client Portal</h1>
        <p className="text-gray-600">
          {isSignUp ? 'Create your account with just your name, email and a password.' : 'Sign in to your secure portal.'}
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-blue-900">
        <Mail className="mt-0.5 h-4 w-4 shrink-0" />
        <span>Use the secure invitation sent by your trustee to connect your account to your file.</span>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div className="space-y-1.5">
            <Label htmlFor="client-name">Full name</Label>
            <Input
              id="client-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              className="h-12"
              disabled={loading}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="client-email">Email address</Label>
          <Input
            id="client-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="h-12"
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="client-password">Password</Label>
          <div className="relative">
            <Input
              id="client-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="h-12 pr-10"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {isSignUp && <p className="text-xs text-gray-500">At least 8 characters.</p>}
        </div>

        <Button type="submit" size="lg" className="h-12 w-full" disabled={loading}>
          {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          {!loading && <ArrowRight className="ml-1.5 h-4 w-4" />}
        </Button>
      </form>

      <div className="space-y-2 text-center text-sm">
        <button type="button" className="text-blue-700 hover:underline" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'I already have an account — sign in' : "I don't have an account yet — create one"}
        </button>
        <div>
          <button type="button" className="text-gray-500 hover:underline" onClick={onSwitchToTrusteePortal}>
            I work at the trustee firm
          </button>
        </div>
      </div>
    </div>
  );
};
