
import React from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

const SignupPage = () => {
  const handleConfirmationSent = (email: string) => {
    console.log('Confirmation sent to:', email);
  };

  const handleSwitchToClientPortal = () => {
    console.log('Switch to client portal');
  };

  return (
    <AuthLayout>
      <AuthForm 
        onConfirmationSent={handleConfirmationSent}
        onSwitchToClientPortal={handleSwitchToClientPortal}
      />
    </AuthLayout>
  );
};

export default SignupPage;
