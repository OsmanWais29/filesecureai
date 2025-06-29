
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertTriangle, Mail, UserPlus } from 'lucide-react';
import { SignUpFields } from './SignUpFields';
import { AuthFields } from './AuthFields';
import { validateAuthForm } from './authValidation';
import { authService } from './authService';
import { useRateLimiting } from './hooks/useRateLimiting';
import { Button } from "@/components/ui/button";
import { detectPortalFromPath } from '@/utils/routing';

interface AuthFormProps {
  onConfirmationSent: (email: string) => void;
  onSwitchToClientPortal: () => void;
}

export const AuthForm = ({ onConfirmationSent, onSwitchToClientPortal }: AuthFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userId, setUserId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authInProgress, setAuthInProgress] = useState(false);
  const { toast } = useToast();
  const { attempts, isRateLimited, timeLeft, recordAttempt, resetAttempts } = useRateLimiting();

  const { isClient, isTrustee } = detectPortalFromPath();

  // Clear errors when switching between sign in and sign up
  useEffect(() => {
    setError(null);
  }, [isSignUp]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (authInProgress) {
      return;
    }
    
    // Validate form inputs
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
    setAuthInProgress(true);

    try {
      console.log(`AuthForm: Starting ${isSignUp ? 'sign up' : 'sign in'} process for ${email}`);
      
      if (isSignUp) {
        const userType = isClient ? 'client' : 'trustee';
        const { user } = await authService.signUp({
          email,
          password,
          fullName,
          userId,
          avatarUrl,
          userType,
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
          const userType = isClient ? 'client' : 'trustee';
          console.log(`AuthForm: Attempting to sign in as ${userType} with email: ${email}`);
          const { user } = await authService.signIn(email, password, userType);
          
          console.log("AuthForm: Sign in successful, user data:", user);
          
          toast({
            title: "Success",
            description: "Successfully signed in!",
          });
          
          // Redirect based on user type
          setTimeout(() => {
            if (isClient) {
              navigate('/client-portal', { replace: true });
            } else {
              navigate('/', { replace: true });
            }
          }, 300);
        } catch (signInError: any) {
          console.error("AuthForm: Sign in error:", signInError);
          if (signInError.message.includes('Email not confirmed')) {
            setError("Please check your email and confirm your account before signing in.");
          } else {
            throw signInError;
          }
        }
      }

      // Reset attempts on successful auth
      resetAttempts();
    } catch (error: any) {
      console.error('AuthForm: Auth error:', error);
      recordAttempt();

      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else if (error.message.includes('Email already registered')) {
        setError('This email is already registered. Try signing in instead.');
      } else if (error.message.includes('Password should be')) {
        setError('Password should be at least 6 characters long');
      } else if (error.message.includes('Access denied') || error.message.includes('not authorized')) {
        setError(error.message);
      } else {
        setError(error.message || 'An error occurred during authentication');
      }
    } finally {
      setLoading(false);
      setAuthInProgress(false);
    }
  };

  const handleSwitchPortal = () => {
    if (isClient) {
      navigate('/login');
    } else {
      navigate('/client-login');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8 rounded-xl border bg-card/95 p-8 shadow-lg backdrop-blur-sm">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary/80 bg-clip-text text-transparent">
          {isSignUp ? 'Create Your Account' : 'Welcome Back'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignUp 
            ? `Sign up for the ${isClient ? 'Client' : 'Trustee'} Portal` 
            : `Sign in to the ${isClient ? 'Client' : 'Trustee'} Portal`
          }
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
          isDisabled={loading || authInProgress}
        />

        <Button
          type="submit"
          disabled={loading || isRateLimited || authInProgress}
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

      <div className="text-center space-y-2">
        <Button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
          }}
          variant="ghost"
          className="text-sm text-primary hover:text-primary/90 hover:underline transition-colors"
        >
          {isSignUp ? 'Sign in instead' : "Create an account"}
        </Button>
        
        <Button
          onClick={handleSwitchPortal}
          variant="ghost"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          Switch to {isClient ? 'Trustee' : 'Client'} Portal
        </Button>
      </div>
    </div>
  );
};
