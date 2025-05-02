
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertTriangle, Mail, UserPlus, User, Building, Phone, FileText, Calendar, MapPin } from 'lucide-react';
import { AuthFields } from './AuthFields';
import { validateAuthForm } from './authValidation';
import { authService } from './authService';
import { useRateLimiting } from './hooks/useRateLimiting';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ClientPortalFormProps {
  onConfirmationSent: (email: string) => void;
  onSwitchToTrusteePortal: () => void;
}

const DIVISION_OFFICES = {
  "11": "Vancouver",
  "21": "Winnipeg",
  "22": "Regina",
  "23": "Saskatoon",
  "24": "Edmonton",
  "25": "Calgary",
  "31": "Toronto",
  "32": "Hamilton",
  "33": "Ottawa",
  "34": "Sudbury (legacy files)",
  "35": "London",
  "41": "Montreal",
  "42": "Sherbrooke",
  "43": "Quebec",
  "51": "Halifax"
};

export const ClientPortalForm = ({ onConfirmationSent, onSwitchToTrusteePortal }: ClientPortalFormProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { attempts, isRateLimited, timeLeft, recordAttempt, resetAttempts } = useRateLimiting();

  // New client bankruptcy fields
  const [adminType, setAdminType] = useState('');
  const [fileNumber, setFileNumber] = useState('');
  const [estateNumber, setEstateNumber] = useState('');
  const [divisionOfficeCode, setDivisionOfficeCode] = useState('');
  const [province, setProvince] = useState('');
  const [dateOfFiling, setDateOfFiling] = useState('');
  const [debtorType, setDebtorType] = useState('');
  const [trustee, setTrustee] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mailingAddress, setMailingAddress] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  
  // Form tabs
  const [activeTab, setActiveTab] = useState('login');

  // Estate number validation
  const validateEstateNumber = (number: string) => {
    if (!number.match(/^\d{2}-\d{7}$/)) {
      return "Estate number must be in XX-YYYYYYY format";
    }
    
    const divisionCode = number.substring(0, 2);
    if (!DIVISION_OFFICES[divisionCode as keyof typeof DIVISION_OFFICES]) {
      return "Invalid division office code in estate number";
    }
    
    if (divisionOfficeCode && divisionCode !== divisionOfficeCode) {
      return "Division office code doesn't match estate number prefix";
    }
    
    return null;
  };

  // Handle division office code change
  const handleDivisionOfficeChange = (value: string) => {
    setDivisionOfficeCode(value);
    
    // Update estate number prefix if it exists
    if (estateNumber.includes('-')) {
      setEstateNumber(`${value}-${estateNumber.split('-')[1]}`);
    } else {
      setEstateNumber(`${value}-`);
    }
  };

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
        // Additional bankruptcy case validation for signup
        if (activeTab === 'bankruptcy' && isSignUp) {
          if (!fullName || !adminType || !fileNumber || !estateNumber || !divisionOfficeCode || !province || !dateOfFiling || !debtorType || !trustee) {
            setError("Please fill in all required fields");
            setLoading(false);
            return;
          }

          const estateNumberError = validateEstateNumber(estateNumber);
          if (estateNumberError) {
            setError(estateNumberError);
            setLoading(false);
            return;
          }

          if (debtorType === 'Corporation' && !businessNumber) {
            setError("Business Number is required for Corporation debtors");
            setLoading(false);
            return;
          }
        }

        // Client signup
        const metadata = activeTab === 'bankruptcy' ? {
          user_type: 'client',
          adminType,
          fileNumber,
          estateNumber,
          divisionOfficeCode,
          province,
          dateOfFiling,
          debtorType,
          trustee,
          phoneNumber,
          mailingAddress,
          businessNumber,
        } : {
          user_type: 'client'
        };

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

  const renderBIACompliance = () => (
    <Alert className="mb-6 bg-blue-50 border-blue-200">
      <FileText className="h-4 w-4 text-blue-500" />
      <AlertDescription className="text-sm">
        <span className="font-semibold">BIA Compliance:</span> All information provided must comply with the Bankruptcy and Insolvency Act. Accurate information ensures proper document structuring and validation.
      </AlertDescription>
    </Alert>
  );

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

      {isSignUp && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Basic Info</TabsTrigger>
            <TabsTrigger value="bankruptcy">Case Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0 pt-4">
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      Full Legal Name *
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

                  <AuthFields
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    isDisabled={loading}
                  />

                  <div className="pt-2">
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      Please complete both tabs for bankruptcy filing information.
                    </p>
                    
                    {!isSignUp ? (
                      <Button
                        type="submit"
                        disabled={loading || isRateLimited}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Sign In
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => setActiveTab('bankruptcy')}
                        className="w-full"
                      >
                        Next: Case Details
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bankruptcy">
            <Card className="border-0 shadow-none">
              <CardHeader className="p-0 pb-4">
                <CardDescription>
                  {renderBIACompliance()}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                <form onSubmit={handleAuth} className="space-y-5">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="adminType">Admin Type *</Label>
                        <Select value={adminType} onValueChange={setAdminType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ordinary">Ordinary</SelectItem>
                            <SelectItem value="Division I">Division I</SelectItem>
                            <SelectItem value="Division II">Division II</SelectItem>
                            <SelectItem value="Summary">Summary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fileNumber">File Number *</Label>
                        <Input 
                          id="fileNumber" 
                          value={fileNumber}
                          onChange={(e) => setFileNumber(e.target.value)}
                          placeholder="TR001-2025"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="estateNumber">Estate Number (XX-YYYYYYY) *</Label>
                        <Input 
                          id="estateNumber" 
                          value={estateNumber}
                          onChange={(e) => setEstateNumber(e.target.value)}
                          placeholder="31-2525252"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="divisionOffice">Division Office *</Label>
                        <Select value={divisionOfficeCode} onValueChange={handleDivisionOfficeChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select office" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(DIVISION_OFFICES).map(([code, name]) => (
                              <SelectItem key={code} value={code}>
                                {code}: {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="province">Province *</Label>
                        <Select value={province} onValueChange={setProvince}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AB">Alberta</SelectItem>
                            <SelectItem value="BC">British Columbia</SelectItem>
                            <SelectItem value="MB">Manitoba</SelectItem>
                            <SelectItem value="NB">New Brunswick</SelectItem>
                            <SelectItem value="NL">Newfoundland and Labrador</SelectItem>
                            <SelectItem value="NS">Nova Scotia</SelectItem>
                            <SelectItem value="ON">Ontario</SelectItem>
                            <SelectItem value="PE">Prince Edward Island</SelectItem>
                            <SelectItem value="QC">Quebec</SelectItem>
                            <SelectItem value="SK">Saskatchewan</SelectItem>
                            <SelectItem value="NT">Northwest Territories</SelectItem>
                            <SelectItem value="NU">Nunavut</SelectItem>
                            <SelectItem value="YT">Yukon</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dateOfFiling">Date of Bankruptcy/Proposal *</Label>
                        <Input 
                          id="dateOfFiling" 
                          type="date"
                          value={dateOfFiling}
                          onChange={(e) => setDateOfFiling(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="debtorType">Type of Debtor *</Label>
                        <Select value={debtorType} onValueChange={setDebtorType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select debtor type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Individual">Individual</SelectItem>
                            <SelectItem value="Corporation">Corporation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="trustee">Trustee Assigned *</Label>
                        <Select value={trustee} onValueChange={setTrustee}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select trustee" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="trustee1">John Smith</SelectItem>
                            <SelectItem value="trustee2">Jane Doe</SelectItem>
                            <SelectItem value="trustee3">Robert Johnson</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                      <Input 
                        id="phoneNumber" 
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="(555) 555-5555"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mailingAddress">Mailing Address (Optional)</Label>
                      <Input 
                        id="mailingAddress" 
                        value={mailingAddress}
                        onChange={(e) => setMailingAddress(e.target.value)}
                        placeholder="123 Main St, City, Province"
                      />
                    </div>
                    
                    {debtorType === 'Corporation' && (
                      <div className="space-y-2">
                        <Label htmlFor="businessNumber">Business Number (Required for Corporations) *</Label>
                        <Input 
                          id="businessNumber" 
                          value={businessNumber}
                          onChange={(e) => setBusinessNumber(e.target.value)}
                          placeholder="123456789"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('login')}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={loading || isRateLimited}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create Client Account
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!isSignUp && (
        <form onSubmit={handleAuth} className="space-y-5">
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
      )}

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
            setActiveTab('login');
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
