
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
        const { user } = await authService.signUp({
          email,
          password,
          fullName,
          userId,
          avatarUrl,
          userType: 'trustee', // Add user type for role-based access
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
          console.log(`AuthForm: Attempting to sign in as trustee with email: ${email}`);
          const { user } = await authService.signIn(email, password, 'trustee');
          
          // Debug logging
          console.log("AuthForm: Sign in successful, user data:", user);
          console.log("AuthForm: User metadata:", user?.user_metadata);
          console.log("AuthForm: User type:", user?.user_metadata?.user_type);
          
          toast({
            title: "Success",
            description: "Successfully signed in!",
          });
          
          // Redirect based on user role
          if (user?.user_metadata?.user_type === 'trustee') {
            console.log("AuthForm: Trustee authentication successful, redirecting to CRM dashboard");
            
            // Add slight delay to ensure state updates
            setTimeout(() => {
              navigate('/crm', { replace: true });
            }, 300);
          } else {
            // If not trustee, sign out and show error
            console.error("AuthForm: User is not a trustee:", user?.user_metadata?.user_type);
            await authService.signOut();
            setError("This account doesn't have trustee access.");
          }
        } catch (signInError: any) {
          console.error("AuthForm: Sign in error:", signInError);
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
      console.error('AuthForm: Auth error:', error);
      recordAttempt();

      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else if (error.message.includes('Email already registered')) {
        setError('This email is already registered. Try signing in instead.');
      } else if (error.message.includes('Password should be')) {
        setError('Password should be at least 6 characters long');
      } else if (error.message.includes('Invalid account type')) {
        setError('This account cannot access the Trustee Portal. Please use a trustee account.');
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
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary/80 bg-clip-text text-transparent">
          {isSignUp ? 'Create Your Trustee Account' : 'Trustee Login'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignUp ? 'Sign up to access SecureFiles AI' : 'Sign in to continue to SecureFiles AI'}
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

      <div className="text-center space-y-3">
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
        
        <div className="pt-2">
          <Button
            onClick={onSwitchToClientPortal}
            variant="outline"
            className="w-full text-sm"
          >
            Switch to Client Portal
          </Button>
        </div>
      </div>
    </div>
  );
};
