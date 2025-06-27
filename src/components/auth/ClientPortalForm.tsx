
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertTriangle, Mail, UserPlus, Phone, MapPin, Briefcase, DollarSign, FileText, Building } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [income, setIncome] = useState('');
  const [preferredContact, setPreferredContact] = useState('');
  
  // New estate and case fields
  const [estateNumber, setEstateNumber] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [location, setLocation] = useState('');
  const [administrativeType, setAdministrativeType] = useState('');
  
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
        const clientMetadata = {
          phone,
          address,
          occupation,
          income,
          preferred_contact: preferredContact,
          estate_number: estateNumber,
          case_number: caseNumber,
          location,
          administrative_type: administrativeType
        };

        const { user } = await authService.signUp({
          email,
          password,
          fullName,
          userId: '',
          avatarUrl: null,
          userType: 'client',
          metadata: clientMetadata
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
            navigate('/client-portal', { replace: true });
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
    <div className="w-full max-w-md mx-auto space-y-6 rounded-2xl border border-blue-200/30 bg-white/95 backdrop-blur-md p-8 shadow-2xl">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          {isSignUp ? 'Create Client Account' : 'Client Portal Login'}
        </h1>
        <p className="text-sm text-gray-600">
          {isSignUp ? 'Register for secure access to your case information' : 'Sign in to your client portal'}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {isSignUp && (
          <>
            <div>
              <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full legal name"
                required
                disabled={loading || authInProgress}
                className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estateNumber" className="text-gray-700 font-medium">Estate Number *</Label>
                <div className="relative mt-1">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="estateNumber"
                    value={estateNumber}
                    onChange={(e) => setEstateNumber(e.target.value)}
                    placeholder="e.g., 31-12345"
                    required
                    disabled={loading || authInProgress}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Format: Division-Number</p>
              </div>

              <div>
                <Label htmlFor="caseNumber" className="text-gray-700 font-medium">Case Number *</Label>
                <div className="relative mt-1">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="caseNumber"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    placeholder="Your case number"
                    required
                    disabled={loading || authInProgress}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="text-gray-700 font-medium">Location *</Label>
              <div className="relative mt-1">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Office location or jurisdiction"
                  required
                  disabled={loading || authInProgress}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="administrativeType" className="text-gray-700 font-medium">Administrative Type *</Label>
              <Select value={administrativeType} onValueChange={setAdministrativeType} required>
                <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select administrative type" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="division1">Division 1</SelectItem>
                  <SelectItem value="division2">Division 2</SelectItem>
                  <SelectItem value="ordinary">Ordinary</SelectItem>
                  <SelectItem value="summary">Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number *</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                  disabled={loading || authInProgress}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="text-gray-700 font-medium">Address *</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full address including postal code"
                  required
                  disabled={loading || authInProgress}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="occupation" className="text-gray-700 font-medium">Occupation *</Label>
              <div className="relative mt-1">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Your current job title"
                  required
                  disabled={loading || authInProgress}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="income" className="text-gray-700 font-medium">Monthly Income *</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="income"
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="Enter monthly income"
                  required
                  disabled={loading || authInProgress}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="preferredContact" className="text-gray-700 font-medium">Preferred Contact Method *</Label>
              <Select value={preferredContact} onValueChange={setPreferredContact} required>
                <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select contact preference" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="text">Text Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div>
          <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading || authInProgress}
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isSignUp ? "Create a secure password (min 6 characters)" : "Enter your password"}
            required
            disabled={loading || authInProgress}
            className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || isRateLimited || authInProgress}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
              <span>Processing...</span>
            </>
          ) : isSignUp ? (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              <span>Create Account</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              <span>Sign In</span>
            </>
          )}
        </Button>

        {attempts > 0 && attempts < 5 && (
          <p className="text-xs text-red-600 text-center">
            {5 - attempts} attempts remaining before temporary lockout
          </p>
        )}
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-500">
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
          className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
        >
          {isSignUp ? 'Sign in instead' : "Create an account"}
        </Button>
        
        <div className="pt-2">
          <Button
            onClick={onSwitchToTrusteePortal}
            variant="outline"
            className="w-full text-sm border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
          >
            Switch to Trustee Portal
          </Button>
        </div>
      </div>
    </div>
  );
};
