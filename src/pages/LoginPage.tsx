
import React from 'react';
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/auth/AuthForm';
import { ConfirmationSentScreen } from '@/components/auth/ConfirmationSentScreen';
import { useState } from 'react';

export default function LoginPage() {
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
