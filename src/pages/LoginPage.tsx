
import React from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

const LoginPage = () => {
  return (
    <AuthLayout>
      <AuthForm mode="login" />
    </AuthLayout>
  );
};

export default LoginPage;
