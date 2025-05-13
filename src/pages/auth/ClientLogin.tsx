
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
  const { user, loading, initialized, subdomain } = useAuthState();
  const [isClientSubdomain, setIsClientSubdomain] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Check if we're on the client subdomain based on our hook data
  useEffect(() => {
    const clientSubdomain = subdomain === 'client';
    setIsClientSubdomain(clientSubdomain);
    
    if (!clientSubdomain) {
      // If we're on trustee subdomain but accessing client login, redirect
      toast.error("Please use the trustee portal for trustee login");
      setRedirecting(true);
      const hostname = window.location.hostname;
      if (hostname === 'localhost') {
        window.location.href = window.location.origin + '?subdomain=trustee';
      } else {
        const hostParts = hostname.split('.');
        if (hostParts.length > 2) {
          hostParts[0] = 'trustee';
          window.location.href = `https://${hostParts.join('.')}/login`;
        } else {
          window.location.href = `https://trustee.${hostname}/login`;
        }
      }
    }
  }, [subdomain]);

  // Redirect if user is already authenticated as a client
  useEffect(() => {
    if (!loading && initialized && user) {
      const userType = user.user_metadata?.user_type;
      console.log('ClientLogin: User authenticated as:', userType, 'on client subdomain:', isClientSubdomain);
      
      if (userType === 'client' && isClientSubdomain) {
        console.log('ClientLogin: User already authenticated as client, redirecting to client portal');
        setRedirecting(true);
        navigate('/portal', { replace: true });
      } else if (userType === 'trustee' && isClientSubdomain) {
        // If user is a trustee on client subdomain, redirect them
        console.log('ClientLogin: Trustee account detected on client subdomain');
        toast.error("Please use the trustee portal for trustee accounts");
        setRedirecting(true);
        
        const hostname = window.location.hostname;
        if (hostname === 'localhost') {
          window.location.href = window.location.origin + '?subdomain=trustee';
        } else {
          const hostParts = hostname.split('.');
          if (hostParts.length > 2) {
            hostParts[0] = 'trustee';
            window.location.href = `https://${hostParts.join('.')}`;
          } else {
            window.location.href = `https://trustee.${hostname}`;
          }
        }
      }
    }
  }, [user, loading, navigate, isClientSubdomain, initialized]);

  const handleConfirmationSent = (email: string) => {
    setConfirmationEmail(email);
    setConfirmationSent(true);
  };

  const handleBackToSignIn = () => {
    setConfirmationSent(false);
  };

  const handleSwitchToTrusteePortal = () => {
    // Redirect to trustee subdomain
    setRedirecting(true);
    const hostname = window.location.hostname;
    if (hostname === 'localhost') {
      // For localhost testing
      window.location.href = window.location.origin + '?subdomain=trustee';
    } else {
      // For actual domain
      const hostParts = hostname.split('.');
      if (hostParts.length > 2) {
        hostParts[0] = 'trustee';
        window.location.href = `https://${hostParts.join('.')}`;
      } else {
        window.location.href = `https://trustee.${hostname}`;
      }
    }
  };

  // Show loading state while checking authentication or redirecting
  if (loading || redirecting) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner />
        <p className="ml-2 text-muted-foreground">
          {redirecting ? 'Redirecting...' : 'Loading...'}
        </p>
      </div>
    );
  }

  // If not on client subdomain, show minimal content that will redirect
  if (!isClientSubdomain) {
    return (
      <AuthLayout isClientPortal={true}>
        <div className="text-center p-8 text-white">
          Redirecting to appropriate login page...
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
            <div className="space-y-4">
              <ClientPortalForm 
                onConfirmationSent={handleConfirmationSent}
                onSwitchToTrusteePortal={handleSwitchToTrusteePortal}
              />
            </div>
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
