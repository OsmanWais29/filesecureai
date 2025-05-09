
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ClientPortalForm } from '@/components/auth/ClientPortalForm';
import { ConfirmationSentScreen } from '@/components/auth/ConfirmationSentScreen';
import { useAuthState } from '@/hooks/useAuthState';
import { useState } from 'react';

const ClientLogin = () => {
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const navigate = useNavigate();
  const { user, loading } = useAuthState();

  // Redirect if user is already authenticated as a client
  useEffect(() => {
    if (!loading && user) {
      const userType = user.user_metadata?.user_type;
      if (userType === 'client') {
        console.log('User already authenticated as client, redirecting to client portal');
        navigate('/client-portal', { replace: true });
      } else if (userType === 'trustee') {
        // If user is a trustee, redirect to trustee portal
        console.log('User is a trustee, redirecting to trustee portal');
        navigate('/crm', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const handleConfirmationSent = (email: string) => {
    setConfirmationEmail(email);
    setConfirmationSent(true);
  };

  const handleBackToSignIn = () => {
    setConfirmationSent(false);
  };

  const handleSwitchToTrusteePortal = () => {
    navigate('/login');
  };

  return (
    <AuthLayout isClientPortal={true}>
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
    </AuthLayout>
  );
};

export default ClientLogin;
