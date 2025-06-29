
import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { HomePage as HomePageContent } from '@/components/dashboard/HomePage';

const HomePage = () => {
  return (
    <AuthGuard>
      <HomePageContent />
    </AuthGuard>
  );
};

export default HomePage;
