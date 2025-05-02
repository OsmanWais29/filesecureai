
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertTriangle, Mail, UserPlus, User } from 'lucide-react';
import { AuthFields } from './AuthFields';
import { validateAuthForm } from './authValidation';
import { authService } from './authService';
import { useRateLimiting } from './hooks/useRateLimiting';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ClientPortalFormProps {
  onConfirmationSent: (email: string) => void;
  onSwitchToTrusteePortal: () => void;
}

export const ClientPortalForm = ({ onConfirmationSent, onSwitchToTrusteePortal }: ClientPortalFormProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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
      fullName
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

    try {
      if (isSignUp) {
        // Client signup
        const { user } = await authService.signUp({
          email,
          password,
          fullName,
          userId: email, // Using email as userId for clients
          avatarUrl: null,
          userType: 'client', // Add user type for role-based access
        });

        if (user?.identities?.length === 0) {
          setError("This email is already registered but not confirmed. Please check your email for the confirmation link.");
        } else {
          onConfirmationSent(email);
          toast({
            title: "Success",
            description: "Please check your email to confirm your client account",
          });
        }
      } else {
        try {
          await authService.signIn(email, password, 'client'); // Add user type for role validation
          toast({
            title: "Welcome to Client Portal",
            description: "Successfully signed in!",
          });
        } catch (signInError: any) {
          if (signInError.message.includes('Email not confirmed')) {
            setError("Please check your email and confirm your account before signing in.");
          } else {
            throw signInError;
          }
        }
      }

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
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary/80 bg-clip-text text-transparent">
          {isSignUp ? 'Create Client Account' : 'Client Portal Login'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignUp ? 'Sign up to access your files and documents' : 'Sign in to view your files and documents'}
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
              />
            </div>
          </div>
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
          className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              <span>Processing...</span>
            </>
          ) : isSignUp ? (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Create Client Account</span>
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
            {isSignUp ? 'Already have a client account?' : "Need a client account?"}
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
          className="text-sm text-primary hover:text-primary/90 hover:underline transition-colors"
        >
          {isSignUp ? 'Sign in instead' : "Create client account"}
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
