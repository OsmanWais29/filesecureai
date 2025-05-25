
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
  const { user, loading, initialized, isTrustee } = useAuthState();
  const [redirecting, setRedirecting] = useState(false);

  // Redirect if already authenticated as trustee
  useEffect(() => {
    if (!loading && initialized && user && !redirecting) {
      const userType = user.user_metadata?.user_type;
      
      if (userType === 'trustee') {
        console.log('User already authenticated as trustee, redirecting to CRM');
        setRedirecting(true);
        navigate('/crm', { replace: true });
      } else if (userType === 'client') {
        console.log('Client account trying to access trustee login');
        toast.error("Please use the client portal for client accounts");
        setRedirecting(true);
        navigate('/client-login', { replace: true });
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

  const handleSwitchToClientPortal = () => {
    setRedirecting(true);
    navigate('/client-login');
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
