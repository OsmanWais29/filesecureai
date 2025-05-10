
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ClientPortalForm } from '@/components/auth/ClientPortalForm';
import { ConfirmationSentScreen } from '@/components/auth/ConfirmationSentScreen';
import { useAuthState } from '@/hooks/useAuthState';
import { useState } from 'react';
import { FileText, Calendar, MessageSquare, ShieldCheck } from 'lucide-react';

const ClientLogin = () => {
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const navigate = useNavigate();
  const { user, loading } = useAuthState();
  const [isClientSubdomain, setIsClientSubdomain] = useState(false);

  // Check if we're on the client subdomain
  useEffect(() => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost';
    
    // For localhost testing
    if (isLocalhost) {
      const urlParams = new URLSearchParams(window.location.search);
      setIsClientSubdomain(urlParams.get('subdomain') === 'client');
    } else {
      // For actual domain with subdomains
      const hostParts = hostname.split('.');
      setIsClientSubdomain(hostParts.length > 2 && hostParts[0] === 'client');
    }
  }, []);

  // Redirect if user is already authenticated as a client
  useEffect(() => {
    if (!loading && user) {
      const userType = user.user_metadata?.user_type;
      
      if (userType === 'client') {
        console.log('User already authenticated as client, redirecting to client portal');
        navigate('/portal', { replace: true });
      } else if (userType === 'trustee' && isClientSubdomain) {
        // If user is a trustee on client subdomain, sign them out
        console.log('Trustee account detected on client subdomain');
        navigate('/', { replace: true });
      }
    }
  }, [user, loading, navigate, isClientSubdomain]);

  const handleConfirmationSent = (email: string) => {
    setConfirmationEmail(email);
    setConfirmationSent(true);
  };

  const handleBackToSignIn = () => {
    setConfirmationSent(false);
  };

  const handleSwitchToTrusteePortal = () => {
    // Redirect to trustee subdomain
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
