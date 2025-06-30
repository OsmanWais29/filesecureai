
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertTriangle, Mail, UserPlus, ArrowRight } from 'lucide-react';
import { SignUpFields } from './SignUpFields';
import { AuthFields } from './AuthFields';
import { validateAuthForm } from './authValidation';
import { authService } from './authService';
import { useRateLimiting } from './hooks/useRateLimiting';
import { Button } from "@/components/ui/button";

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
  const [authInProgress, setAuthInProgress] = useState(false);
  const { toast } = useToast();
  const { attempts, isRateLimited, timeLeft, recordAttempt, resetAttempts } = useRateLimiting();

  // Clear errors when switching between sign in and sign up
  useEffect(() => {
    setError(null);
  }, [isSignUp]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authInProgress) {
      return;
    }
    
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

    if (isRateLimited) {
      setError(`Too many attempts. Please wait ${timeLeft} seconds before trying again`);
      return;
    }

    setLoading(true);
    setError(null);
    setAuthInProgress(true);

    try {
      if (isSignUp) {
        const { user } = await authService.signUp({
          email,
          password,
          fullName,
          userId,
          avatarUrl,
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
          const { user } = await authService.signIn(email, password, 'client');
          
          toast({
            title: "Welcome back!",
            description: "Successfully signed in to your client portal",
          });
          
          setTimeout(() => {
            navigate('/client-portal', { replace: true });
          }, 300);
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

  return (
    <div className="w-full max-w-md mx-auto space-y-8 rounded-2xl border border-blue-200/50 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
      <div className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Lock className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-gray-600">
          {isSignUp 
            ? 'Sign up for secure access to your client portal' 
            : 'Sign in to access your secure client portal'
          }
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleAuth} className="space-y-6">
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
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
              <span>Processing...</span>
            </>
          ) : isSignUp ? (
            <>
              <UserPlus className="h-5 w-5 mr-2" />
              <span>Create Account</span>
            </>
          ) : (
            <>
              <ArrowRight className="h-5 w-5 mr-2" />
              <span>Sign In</span>
            </>
          )}
        </Button>

        {attempts > 0 && attempts < 5 && (
          <p className="text-xs text-red-600 text-center font-medium">
            {5 - attempts} attempts remaining before temporary lockout
          </p>
        )}
      </form>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            variant="ghost"
            className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
          >
            {isSignUp ? 'Sign in to existing account' : "Create a new account"}
          </Button>
          
          <Button
            onClick={onSwitchToTrusteePortal}
            variant="ghost"
            className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-sm"
          >
            Are you a trustee? Switch to Trustee Portal
          </Button>
        </div>
      </div>
    </div>
  );
};
