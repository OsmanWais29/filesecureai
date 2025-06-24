
import React from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

const SignupPage = () => {
  return (
    <AuthLayout>
      <AuthForm mode="signup" />
    </AuthLayout>
  );
};

export default SignupPage;
