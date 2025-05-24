
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
  const { user, loading, initialized, subdomain, isTrustee } = useAuthState();
  const [redirecting, setRedirecting] = useState(false);

  // Check if we're on the right subdomain
  const isOnTrusteeSubdomain = subdomain !== 'client';

  // Redirect if not on trustee subdomain
  useEffect(() => {
    if (subdomain === 'client') {
      console.log("On client subdomain, redirecting to client login");
      toast.error("Please use the client portal for client login");
      setRedirecting(true);
      
      setTimeout(() => {
        const hostname = window.location.hostname;
        if (hostname === 'localhost') {
          window.location.href = window.location.origin + '?subdomain=client';
        } else {
          window.location.href = `https://client.${hostname.split('.').slice(-2).join('.')}/login`;
        }
      }, 100);
    }
  }, [subdomain]);

  // Redirect if already authenticated as trustee
  useEffect(() => {
    if (!loading && initialized && user && isOnTrusteeSubdomain && !redirecting) {
      const userType = user.user_metadata?.user_type;
      
      if (userType === 'trustee') {
        console.log('User already authenticated as trustee, redirecting to CRM');
        setRedirecting(true);
        navigate('/crm', { replace: true });
      } else if (userType === 'client') {
        console.log('Client account on trustee subdomain, redirecting');
        toast.error("Please use the client portal for client accounts");
        setRedirecting(true);
        
        setTimeout(() => {
          const hostname = window.location.hostname;
          if (hostname === 'localhost') {
            window.location.href = window.location.origin + '?subdomain=client';
          } else {
            window.location.href = `https://client.${hostname.split('.').slice(-2).join('.')}`;
          }
        }, 100);
      }
    }
  }, [user, loading, navigate, isOnTrusteeSubdomain, initialized, redirecting]);

  const handleConfirmationSent = (email: string) => {
    setConfirmationEmail(email);
    setConfirmationSent(true);
  };

  const handleBackToSignIn = () => {
    setConfirmationSent(false);
  };

  const handleSwitchToClientPortal = () => {
    setRedirecting(true);
    
    setTimeout(() => {
      const hostname = window.location.hostname;
      if (hostname === 'localhost') {
        window.location.href = window.location.origin + '?subdomain=client';
      } else {
        window.location.href = `https://client.${hostname.split('.').slice(-2).join('.')}`;
      }
    }, 100);
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

  if (!isOnTrusteeSubdomain) {
    return (
      <AuthLayout isClientPortal={false}>
        <div className="text-center p-8">
          Redirecting to client portal...
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
