
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ClientPortalForm } from '@/components/auth/ClientPortalForm';
import { ConfirmationSentScreen } from '@/components/auth/ConfirmationSentScreen';
import { useAuthState } from '@/hooks/useAuthState';
import { redirectToSubdomain } from '@/utils/subdomain';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FileText, Calendar, MessageSquare, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const ClientLogin = () => {
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const navigate = useNavigate();
  const { user, loading, initialized, isClient, isTrustee } = useAuthState();
  const [redirecting, setRedirecting] = useState(false);

  // Redirect if not on client subdomain
  useEffect(() => {
    if (isTrustee) {
      console.log("Not on client subdomain, redirecting to trustee login");
      toast.error("Please use the trustee portal for trustee login");
      setRedirecting(true);
      redirectToSubdomain('trustee', '/login');
    }
  }, [isTrustee]);

  // Redirect if already authenticated as client
  useEffect(() => {
    if (!loading && initialized && user && isClient && !redirecting) {
      const userType = user.user_metadata?.user_type;
      
      if (userType === 'client') {
        console.log('User already authenticated as client, redirecting to portal');
        setRedirecting(true);
        navigate('/portal', { replace: true });
      } else if (userType === 'trustee') {
        console.log('Trustee account on client subdomain, redirecting');
        toast.error("Please use the trustee portal for trustee accounts");
        setRedirecting(true);
        redirectToSubdomain('trustee');
      }
    }
  }, [user, loading, navigate, isClient, initialized, redirecting]);

  const handleConfirmationSent = (email: string) => {
    setConfirmationEmail(email);
    setConfirmationSent(true);
  };

  const handleBackToSignIn = () => {
    setConfirmationSent(false);
  };

  const handleSwitchToTrusteePortal = () => {
    setRedirecting(true);
    redirectToSubdomain('trustee');
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

  if (!isClient) {
    return (
      <AuthLayout isClientPortal={true}>
        <div className="text-center p-8 text-white">
          Redirecting to trustee portal...
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout isClientPortal={true}>
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-7xl mx-auto mt-8 md:mt-12">
        <div className="w-full md:w-1/2 lg:w-1/3 order-2 md:order-1">
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
        
        <div className="w-full md:w-1/2 lg:w-1/2 text-center md:text-left order-1 md:order-2">
          <div className="text-white space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Client Portal Access
            </h1>
            <p className="text-xl text-white/90">
              Your secure gateway to tracking your case progress and communicating with your trustee.
            </p>
            <div className="hidden md:block">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="text-lg">View and download important documents</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <span className="text-lg">Schedule and manage appointments</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <span className="text-lg">Communicate securely with your trustee</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-lg">Access your case details securely anytime</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ClientLogin;
