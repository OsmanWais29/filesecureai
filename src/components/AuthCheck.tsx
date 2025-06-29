
import React from 'react';
import { useSessionContext } from '@/contexts/SessionContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthForm } from '@/components/auth/AuthForm';
import { useState } from 'react';
import { ConfirmationSentScreen } from '@/components/auth/ConfirmationSentScreen';

interface AuthCheckProps {
  children: React.ReactNode;
}

export const AuthCheck: React.FC<AuthCheckProps> = ({ children }) => {
  const { user, loading } = useSessionContext();
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');

  const handleConfirmationSent = (email: string) => {
    setConfirmationEmail(email);
    setConfirmationSent(true);
  };

  const handleBackToSignIn = () => {
    setConfirmationSent(false);
  };

  const handleSwitchToClientPortal = () => {
    console.log('Switch to client portal');
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <AuthLayout>
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
  }

  return <>{children}</>;
};
