
import { useState } from 'react';
import { AuthLayout } from './auth/AuthLayout';
import { AuthForm } from './auth/AuthForm';
import { ConfirmationSentScreen } from './auth/ConfirmationSentScreen';
import { ClientPortalForm } from './auth/ClientPortalForm';

export type AuthMode = 'trustee' | 'client';

interface AuthProps {
  isClientPortal?: boolean;
}

export const Auth = ({ isClientPortal = false }: AuthProps) => {
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>(isClientPortal ? 'client' : 'trustee');

  const handleConfirmationSent = (email: string) => {
    setConfirmationEmail(email);
    setConfirmationSent(true);
  };

  const handleBackToSignIn = () => {
    setConfirmationSent(false);
  };

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'trustee' ? 'client' : 'trustee');
  };

  return (
    <AuthLayout isClientPortal={isClientPortal}>
      {confirmationSent ? (
        <ConfirmationSentScreen 
          email={confirmationEmail}
          onBackToSignIn={handleBackToSignIn}
        />
      ) : (
        authMode === 'trustee' ? (
          <AuthForm 
            onConfirmationSent={handleConfirmationSent} 
            onSwitchToClientPortal={toggleAuthMode}
          />
        ) : (
          <ClientPortalForm 
            onConfirmationSent={handleConfirmationSent}
            onSwitchToTrusteePortal={toggleAuthMode}
          />
        )
      )}
    </AuthLayout>
  );
};
