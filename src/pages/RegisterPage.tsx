
import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/auth/AuthForm';
import { ConfirmationSentScreen } from '@/components/auth/ConfirmationSentScreen';
import { useState } from 'react';

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const [isConfirmationSent, setIsConfirmationSent] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');

  // Redirect if already logged in
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout>
      <div className="flex min-h-screen items-center justify-center">
        {isConfirmationSent ? (
          <ConfirmationSentScreen 
            email={confirmationEmail}
            onBackToSignIn={() => setIsConfirmationSent(false)}
          />
        ) : (
          <AuthForm 
            onConfirmationSent={(email) => {
              setConfirmationEmail(email);
              setIsConfirmationSent(true);
            }}
          />
        )}
      </div>
    </AuthLayout>
  );
}
