import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertTriangle, Mail, UserPlus } from 'lucide-react';
import { SignUpFields } from './SignUpFields';
import { AuthFields } from './AuthFields';
import { validateAuthForm } from './authValidation';
import { authService } from './authService';
import { useRateLimiting } from './hooks/useRateLimiting';
import { Button } from "@/components/ui/button";
import { AuthMode } from '../Auth';

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
  const [userId, setUserId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { attempts, isRateLimited, timeLeft, recordAttempt, resetAttempts } = useRateLimiting();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateAuthForm({
      email,
      password,
      isSignUp,
      fullName,
      userId
    });
    
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    // Check for rate limiting
    if (isRateLimited) {
      setError(`Too many attempts. Please wait ${timeLeft} seconds before trying again`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { user } = await authService.signUp({
          email,
          password,
          fullName,
          userId,
          avatarUrl,
          userType: 'client', // Explicitly set userType to client for the client portal
        });

        if (user?.identities?.length === 0) {
          // User already exists but hasn't confirmed their email
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
          // Explicitly set userType to client when signing in through client portal
          const { user } = await authService.signIn(email, password, 'client');
          toast({
            title: "Success",
            description: "Successfully signed in!",
          });
          
          // Redirect to client portal after successful authentication
          if (user?.user_metadata?.user_type === 'client') {
            // Ensure we're using the correct route for client portal
            navigate('/client-portal', { replace: true });
            console.log("Redirecting client to /client-portal");
          } else {
            // If not client, sign out and show error
            await authService.signOut();
            setError("This account doesn't have client access.");
          }
          
        } catch (signInError: any) {
          if (signInError.message.includes('Email not confirmed')) {
            // Handle the email confirmation error specifically
            setError("Please check your email and confirm your account before signing in.");
          } else {
            throw signInError;
          }
        }
      }

      // Reset attempts on successful auth
      resetAttempts();
    } catch (error: any) {
      console.error('Auth error:', error);
      recordAttempt();

      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else if (error.message.includes('Email already registered')) {
        setError('This email is already registered. Try signing in instead.');
      } else if (error.message.includes('Password should be')) {
        setError('Password should be at least 6 characters long');
      } else if (error.message.includes('Invalid account type')) {
        setError('This account cannot access the Client Portal. Please use a client account.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8 rounded-xl border bg-card/95 p-8 shadow-lg backdrop-blur-sm">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          {isSignUp ? 'Create Your Client Account' : 'Client Login'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignUp ? 'Sign up to access the Client Portal' : 'Sign in to continue to Client Portal'}
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
          <SignUpFields
            fullName={fullName}
            setFullName={setFullName}
            userId={userId}
            setUserId={setUserId}
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
          />
        )}

        <AuthFields
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isDisabled={loading}
        />

        <Button
          type="submit"
          disabled={loading || isRateLimited}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          <div className="w-full border-t border-muted"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground">
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
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
        >
          {isSignUp ? 'Sign in instead' : "Create an account"}
        </Button>
        
        <div className="pt-2">
          <Button
            onClick={onSwitchToTrusteePortal}
            variant="outline"
            className="w-full text-sm"
          >
            Switch to Trustee Portal
          </Button>
        </div>
      </div>
    </div>
  );
};
