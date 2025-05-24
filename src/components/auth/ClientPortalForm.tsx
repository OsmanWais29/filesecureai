
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertTriangle, Mail, UserPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from './authService';
import { useRateLimiting } from './hooks/useRateLimiting';
import { validateAuthForm } from './authValidation';

interface ClientPortalFormProps {
  onConfirmationSent: (email: string) => void;
  onSwitchToTrusteePortal: () => void;
}

export const ClientPortalForm = ({ onConfirmationSent, onSwitchToTrusteePortal }: ClientPortalFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authInProgress, setAuthInProgress] = useState(false);
  const { toast } = useToast();
  const { attempts, isRateLimited, timeLeft, recordAttempt, resetAttempts } = useRateLimiting();

  // Clear errors when switching between sign in and sign up
  useEffect(() => {
    setError(null);
  }, [isSignUp]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authInProgress) return;
    
    const validation = validateAuthForm({
      email,
      password,
      isSignUp,
      fullName,
      userId: ''
    });
    
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    if (isRateLimited) {
      setError(`Too many attempts. Please wait ${timeLeft} seconds before trying again`);
      return;
    }

    setLoading(true);
    setError(null);
    setAuthInProgress(true);

    try {
      console.log(`ClientPortalForm: Starting ${isSignUp ? 'sign up' : 'sign in'} process for ${email}`);
      
      if (isSignUp) {
        const { user } = await authService.signUp({
          email,
          password,
          fullName,
          userId: '',
          avatarUrl: null,
          userType: 'client',
        });

        if (user?.identities?.length === 0) {
          setError("This email is already registered but not confirmed. Please check your email for the confirmation link.");
        } else {
          onConfirmationSent(email);
          toast({
            title: "Success",
            description: "Please check your email to confirm your account",
          });
        }
      } else {
        try {
          console.log(`ClientPortalForm: Attempting to sign in as client with email: ${email}`);
          const { user } = await authService.signIn(email, password, 'client');
          
          console.log("ClientPortalForm: Sign in successful, user data:", user);
          
          toast({
            title: "Success",
            description: "Successfully signed in!",
          });
          
          // Redirect to client portal
          console.log("ClientPortalForm: Client authentication successful, redirecting to portal");
          setTimeout(() => {
            navigate('/portal', { replace: true });
          }, 300);
          
        } catch (signInError: any) {
          console.error("ClientPortalForm: Sign in error:", signInError);
          if (signInError.message.includes('Email not confirmed')) {
            setError("Please check your email and confirm your account before signing in.");
          } else {
            throw signInError;
          }
        }
      }

      resetAttempts();
    } catch (error: any) {
      console.error('ClientPortalForm: Auth error:', error);
      recordAttempt();

      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else if (error.message.includes('Email already registered')) {
        setError('This email is already registered. Try signing in instead.');
      } else if (error.message.includes('Password should be')) {
        setError('Password should be at least 6 characters long');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
      setAuthInProgress(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8 rounded-xl border bg-card/95 p-8 shadow-lg backdrop-blur-sm">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">
          {isSignUp ? 'Create Client Account' : 'Client Portal Login'}
        </h1>
        <p className="text-sm text-white/80">
          {isSignUp ? 'Sign up for client access' : 'Sign in to your client portal'}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="border border-destructive/20 bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleAuth} className="space-y-5">
        {isSignUp && (
          <div>
            <Label htmlFor="fullName" className="text-white">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              disabled={loading || authInProgress}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
        )}

        <div>
          <Label htmlFor="email" className="text-white">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={loading || authInProgress}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
        </div>

        <div>
          <Label htmlFor="password" className="text-white">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={loading || authInProgress}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || isRateLimited || authInProgress}
          className="w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              <span>Processing...</span>
            </>
          ) : isSignUp ? (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Sign Up</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Sign In</span>
            </>
          )}
        </Button>

        {attempts > 0 && attempts < 5 && (
          <p className="text-xs text-destructive text-center">
            {5 - attempts} attempts remaining before temporary lockout
          </p>
        )}
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-transparent px-2 text-white/80">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
        </div>
      </div>

      <div className="text-center space-y-3">
        <Button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
          }}
          variant="ghost"
          className="text-sm text-white hover:text-white/90 hover:underline"
        >
          {isSignUp ? 'Sign in instead' : "Create an account"}
        </Button>
        
        <div className="pt-2">
          <Button
            onClick={onSwitchToTrusteePortal}
            variant="outline"
            className="w-full text-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Switch to Trustee Portal
          </Button>
        </div>
      </div>
    </div>
  );
};
