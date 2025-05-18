import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { user, loading, initialized, subdomain, isTrustee } = useAuthState();
  const [isTrusteeSubdomain, setIsTrusteeSubdomain] = useState(true); // Default to true
  const [redirecting, setRedirecting] = useState(false);
  const [authStarted, setAuthStarted] = useState(false);

  // Record the time the component mounted for debugging
  useEffect(() => {
    console.log(`TrusteeLogin: Component mounted at ${new Date().toISOString()}`);
    
    // Set a flag indicating auth flow has started
    setAuthStarted(true);
    
    return () => {
      console.log(`TrusteeLogin: Component unmounted at ${new Date().toISOString()}`);
    };
  }, []);

  // Check if we're on the trustee subdomain
  useEffect(() => {
    if (!subdomain && !loading) {
      console.log("TrusteeLogin: No subdomain detected yet, waiting...");
      return;
    }
    
    const isClientSubdomain = subdomain === 'client';
    setIsTrusteeSubdomain(!isClientSubdomain);
    
    console.log(`TrusteeLogin: Subdomain check - detected: ${subdomain}, isClientSubdomain: ${isClientSubdomain}`);
    
    if (isClientSubdomain) {
      // If we're on client subdomain but accessing trustee login, redirect
      console.log("TrusteeLogin: On client subdomain, redirecting to client login");
      toast.error("Please use the client portal for client login");
      setRedirecting(true);
      
      setTimeout(() => {
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
      }, 100);
    }
  }, [subdomain, loading]);

  // Redirect if user is already authenticated as a trustee
  useEffect(() => {
    if (!loading && initialized && user && authStarted) {
      const userType = user.user_metadata?.user_type;
      console.log('TrusteeLogin: User authenticated as:', userType, 'on', isTrusteeSubdomain ? 'trustee' : 'client', 'subdomain');
      
      // Added debug logging for user data
      console.log('TrusteeLogin: User data:', {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      });
      
      // Prevent multiple redirects
      if (redirecting) {
        return;
      }
      
      if (userType === 'trustee' && isTrusteeSubdomain) {
        console.log('TrusteeLogin: User already authenticated as trustee, redirecting to CRM dashboard');
        setRedirecting(true);
        
        // Use timeout to ensure we don't interrupt the current render cycle
        setTimeout(() => {
          navigate('/crm', { replace: true });
        }, 150);
      } else if (userType === 'client' && isTrusteeSubdomain) {
        // If user is a client on trustee subdomain, redirect them
        console.log('TrusteeLogin: Client account detected on trustee subdomain');
        toast.error("Please use the client portal for client accounts");
        setRedirecting(true);
        
        setTimeout(() => {
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
        }, 100);
      }
    }
  }, [user, loading, navigate, isTrusteeSubdomain, initialized, redirecting, authStarted]);

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
    
    setTimeout(() => {
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
    }, 100);
  };

  // Show loading state while checking authentication
  if (loading || redirecting) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-muted-foreground">
          {redirecting ? 'Redirecting...' : 'Loading...'}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {subdomain ? `Domain: ${subdomain}` : 'Detecting domain...'}
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
