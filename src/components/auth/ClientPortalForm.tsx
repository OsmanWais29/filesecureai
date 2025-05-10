
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertTriangle, Mail, UserPlus, ArrowRight, Check } from 'lucide-react';
import { ClientSignUpFields } from './ClientSignUpFields';
import { AuthFields } from './AuthFields';
import { validateAuthForm } from './authValidation';
import { authService } from './authService';
import { useRateLimiting } from './hooks/useRateLimiting';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [income, setIncome] = useState('');
  const [preferredContact, setPreferredContact] = useState('email');
  // New fields
  const [estateNumber, setEstateNumber] = useState('');
  const [fileNumber, setFileNumber] = useState('');
  const [location, setLocation] = useState('');
  
  const [activeTab, setActiveTab] = useState<string>("signin");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { attempts, isRateLimited, timeLeft, recordAttempt, resetAttempts } = useRateLimiting();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isSignUp = activeTab === "signup";
    
    const validation = validateAuthForm({
      email,
      password,
      isSignUp,
      fullName,
      ...(isSignUp && { estateNumber }) // Adding validation for estateNumber when signing up
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
          userType: 'client', // Explicitly set userType to client
          // Add additional user metadata for the enhanced fields
          metadata: {
            phone,
            address,
            occupation,
            income,
            preferred_contact: preferredContact,
            estate_number: estateNumber,
            file_number: fileNumber,
            location: location
          }
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
    <div className="w-full max-w-md mx-auto space-y-6 rounded-xl border border-blue-100 bg-white/95 p-6 md:p-8 shadow-lg backdrop-blur-sm">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
          {activeTab === "signup" ? 'Create Your Client Account' : 'Welcome Back'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {activeTab === "signup" ? 'Sign up to access your dedicated Client Portal' : 'Sign in to continue to your Client Portal'}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="border border-destructive/20 bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleAuth} className="space-y-5">
          <TabsContent value="signin">
            <AuthFields
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isDisabled={loading}
            />
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-6">
            <AuthFields
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isDisabled={loading}
            />
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-blue-100"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-muted-foreground">
                  Client Information
                </span>
              </div>
            </div>
            
            <ClientSignUpFields
              fullName={fullName}
              setFullName={setFullName}
              userId={userId}
              setUserId={setUserId}
              avatarUrl={avatarUrl}
              setAvatarUrl={setAvatarUrl}
              phone={phone}
              setPhone={setPhone}
              address={address}
              setAddress={setAddress}
              occupation={occupation}
              setOccupation={setOccupation}
              income={income}
              setIncome={setIncome}
              preferredContact={preferredContact}
              setPreferredContact={setPreferredContact}
              estateNumber={estateNumber}
              setEstateNumber={setEstateNumber}
              fileNumber={fileNumber}
              setFileNumber={setFileNumber}
              location={location}
              setLocation={setLocation}
            />
          </TabsContent>
          
          <Button
            type="submit"
            disabled={loading || isRateLimited}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-3 text-white hover:from-blue-800 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                <span>Processing...</span>
              </>
            ) : activeTab === "signup" ? (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" />
                <span>Sign In</span>
              </>
            )}
          </Button>
        </form>
      </Tabs>

      {attempts > 0 && attempts < 5 && (
        <p className="text-xs text-destructive text-center">
          {5 - attempts} attempts remaining before temporary lockout
        </p>
      )}

      <div className="text-center space-y-4 pt-2">
        <Button
          onClick={onSwitchToTrusteePortal}
          variant="outline"
          className="w-full text-sm border-blue-200 hover:bg-blue-50"
        >
          Switch to Trustee Portal
        </Button>
      </div>
    </div>
  );
};
