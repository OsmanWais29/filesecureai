
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ArrowRight, User, Home, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthState } from '@/hooks/useAuthState';

const ONBOARDING_STEPS = [
  { id: 'personal', title: 'Personal Information', icon: User },
  { id: 'contact', title: 'Contact Details', icon: Phone },
  { id: 'address', title: 'Address Information', icon: Home },
  { id: 'emergency', title: 'Emergency Contact', icon: Mail },
];

export const ClientOnboarding = () => {
  const { user } = useAuthState();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    date_of_birth: '',
    occupation: '',
    income: '',
    
    // Contact Details
    phone: '',
    email: user?.email || '',
    preferred_contact: 'email',
    
    // Address Information
    address: '',
    
    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateCurrentStep = () => {
    const step = ONBOARDING_STEPS[currentStep];
    
    switch (step.id) {
      case 'personal':
        return formData.full_name && formData.date_of_birth;
      case 'contact':
        return formData.phone && formData.email;
      case 'address':
        return formData.address;
      case 'emergency':
        return formData.emergency_contact_name && formData.emergency_contact_phone;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      setError('Please fill in all required fields');
      return;
    }
    
    setError(null);
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...formData,
          income: formData.income ? parseFloat(formData.income) : null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Mark onboarding as complete
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });

      if (settingsError) console.error('Settings update error:', settingsError);

      toast.success('Welcome! Your profile has been created successfully.');
      navigate('/portal');
    } catch (error: any) {
      console.error('Onboarding completion error:', error);
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = ONBOARDING_STEPS[currentStep];

    switch (step.id) {
      case 'personal':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => updateFormData('full_name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => updateFormData('date_of_birth', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => updateFormData('occupation', e.target.value)}
                placeholder="Enter your occupation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income">Annual Income</Label>
              <Input
                id="income"
                type="number"
                value={formData.income}
                onChange={(e) => updateFormData('income', e.target.value)}
                placeholder="Enter your annual income"
              />
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="Enter your email"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred_contact">Preferred Contact Method</Label>
              <Select
                value={formData.preferred_contact}
                onValueChange={(value) => updateFormData('preferred_contact', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="text">Text Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'address':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                placeholder="Enter your full address including city, province, and postal code"
                rows={4}
              />
            </div>
          </div>
        );

      case 'emergency':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Emergency Contact Name *</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={(e) => updateFormData('emergency_contact_name', e.target.value)}
                placeholder="Enter emergency contact name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">Emergency Contact Phone *</Label>
              <Input
                id="emergency_contact_phone"
                type="tel"
                value={formData.emergency_contact_phone}
                onChange={(e) => updateFormData('emergency_contact_phone', e.target.value)}
                placeholder="Enter emergency contact phone"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-primary/5 to-background p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to SecureFiles AI</h1>
          <p className="text-muted-foreground">Let's set up your profile to get started</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="flex items-center gap-2">
                {React.createElement(ONBOARDING_STEPS[currentStep].icon, { className: "h-5 w-5" })}
                {ONBOARDING_STEPS[currentStep].title}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {renderStepContent()}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={loading || !validateCurrentStep()}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : currentStep === ONBOARDING_STEPS.length - 1 ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Setup
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
