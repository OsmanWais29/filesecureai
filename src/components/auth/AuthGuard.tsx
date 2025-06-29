
import React from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AuthLayout } from './AuthLayout';
import { AuthForm } from './AuthForm';
import { ConfirmationSentScreen } from './ConfirmationSentScreen';
import { useState } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuthState();
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
    // Handle client portal switch if needed
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
