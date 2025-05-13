
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthForm } from '@/components/auth/AuthForm';
import { ConfirmationSentScreen } from '@/components/auth/ConfirmationSentScreen';
import { useAuthState } from '@/hooks/useAuthState';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const TrusteeLogin = () => {
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const navigate = useNavigate();
  const { user, loading, initialized, subdomain } = useAuthState();
  const [isTrusteeSubdomain, setIsTrusteeSubdomain] = useState(true); // Default to true
  const [redirecting, setRedirecting] = useState(false);

  // Check if we're on the trustee subdomain
  useEffect(() => {
    const isClientSubdomain = subdomain === 'client';
    setIsTrusteeSubdomain(!isClientSubdomain);
    
    if (isClientSubdomain) {
      // If we're on client subdomain but accessing trustee login, redirect
      toast.error("Please use the client portal for client login");
      setRedirecting(true);
      const hostname = window.location.hostname;
      if (hostname === 'localhost') {
        window.location.href = window.location.origin + '?subdomain=client';
      } else {
        const hostParts = hostname.split('.');
        if (hostParts.length > 2) {
          hostParts[0] = 'client';
          window.location.href = `https://${hostParts.join('.')}/login`;
        } else {
          window.location.href = `https://client.${hostname}/login`;
        }
      }
    }
  }, [subdomain]);

  // Redirect if user is already authenticated as a trustee
  useEffect(() => {
    if (!loading && initialized && user) {
      const userType = user.user_metadata?.user_type;
      console.log('TrusteeLogin: User authenticated as:', userType, 'on', isTrusteeSubdomain ? 'trustee' : 'client', 'subdomain');
      
      // Added debug logging for user data
      console.log('TrusteeLogin: User data:', {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      });
      
      if (userType === 'trustee' && isTrusteeSubdomain) {
        console.log('TrusteeLogin: User already authenticated as trustee, redirecting to CRM dashboard');
        setRedirecting(true);
        navigate('/crm', { replace: true });
      } else if (userType === 'client' && isTrusteeSubdomain) {
        // If user is a client on trustee subdomain, redirect them
        console.log('TrusteeLogin: Client account detected on trustee subdomain');
        toast.error("Please use the client portal for client accounts");
        setRedirecting(true);
        
        const hostname = window.location.hostname;
        if (hostname === 'localhost') {
          window.location.href = window.location.origin + '?subdomain=client';
        } else {
          const hostParts = hostname.split('.');
          if (hostParts.length > 2) {
            hostParts[0] = 'client';
            window.location.href = `https://${hostParts.join('.')}`;
          } else {
            window.location.href = `https://client.${hostname}`;
          }
        }
      }
    }
  }, [user, loading, navigate, isTrusteeSubdomain, initialized]);

  const handleConfirmationSent = (email: string) => {
    setConfirmationEmail(email);
    setConfirmationSent(true);
  };

  const handleBackToSignIn = () => {
    setConfirmationSent(false);
  };

  const handleSwitchToClientPortal = () => {
    // Redirect to client subdomain
    setRedirecting(true);
    const hostname = window.location.hostname;
    if (hostname === 'localhost') {
      // For localhost testing
      window.location.href = window.location.origin + '?subdomain=client';
    } else {
      // For actual domain
      const hostParts = hostname.split('.');
      if (hostParts.length > 2) {
        hostParts[0] = 'client';
        window.location.href = `https://${hostParts.join('.')}`;
      } else {
        window.location.href = `https://client.${hostname}`;
      }
    }
  };

  // Show loading state while checking authentication
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

  // If not on trustee subdomain, show minimal content that will redirect
  if (!isTrusteeSubdomain) {
    return (
      <AuthLayout isClientPortal={false}>
        <div className="text-center p-8">
          Redirecting to appropriate login page...
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout isClientPortal={false}>
      {confirmationSent ? (
        <ConfirmationSentScreen 
          email={confirmationEmail}
          onBackToSignIn={handleBackToSignIn}
        />
      ) : (
        <AuthForm 
          onConfirmationSent={handleConfirmationSent} 
          onSwitchToClientPortal={handleSwitchToClientPortal}
        />
      )}
    </AuthLayout>
  );
};

export default TrusteeLogin;
