
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ClientPortalForm } from '@/components/auth/ClientPortalForm';
import { ConfirmationSentScreen } from '@/components/auth/ConfirmationSentScreen';
import { useAuthState } from '@/hooks/useAuthState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FileText, Calendar, MessageSquare, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const ClientLogin = () => {
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const navigate = useNavigate();
  const { user, loading, initialized, isClient } = useAuthState();
  const [redirecting, setRedirecting] = useState(false);

  // Redirect if already authenticated as client
  useEffect(() => {
    if (!loading && initialized && user && !redirecting) {
      const userType = user.user_metadata?.user_type;
      
      if (userType === 'client') {
        console.log('User already authenticated as client, redirecting to portal');
        setRedirecting(true);
        navigate('/client-portal', { replace: true });
      } else if (userType === 'trustee') {
        console.log('Trustee account trying to access client login');
        toast.error("Please use the trustee portal for trustee accounts");
        setRedirecting(true);
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, navigate, initialized, redirecting]);

  const handleConfirmationSent = (email: string) => {
    setConfirmationEmail(email);
    setConfirmationSent(true);
  };

  const handleBackToSignIn = () => {
    setConfirmationSent(false);
  };

  const handleSwitchToTrusteePortal = () => {
    setRedirecting(true);
    navigate('/login');
  };

  if (loading || redirecting) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-muted-foreground">
          {redirecting ? 'Redirecting...' : 'Loading...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Form */}
          <div className="flex justify-center lg:justify-end">
            {confirmationSent ? (
              <ConfirmationSentScreen 
                email={confirmationEmail}
                onBackToSignIn={handleBackToSignIn}
              />
            ) : (
              <ClientPortalForm 
                onConfirmationSent={handleConfirmationSent}
                onSwitchToTrusteePortal={handleSwitchToTrusteePortal}
              />
            )}
          </div>
          
          {/* Right side - Information */}
          <div className="text-white space-y-8 lg:pl-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Client Portal Access
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Your secure gateway to tracking your case progress and communicating with your trustee.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">View and Download Documents</h3>
                  <p className="text-blue-100">Access all your important documents securely</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Schedule and Manage Appointments</h3>
                  <p className="text-blue-100">Book meetings with your trustee at your convenience</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Communicate Securely</h3>
                  <p className="text-blue-100">Send messages and receive updates from your trustee</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Access Case Details Securely</h3>
                  <p className="text-blue-100">Monitor your case progress with bank-level security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;
