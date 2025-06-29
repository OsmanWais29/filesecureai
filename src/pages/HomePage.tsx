
import React from 'react';
import { useSessionContext } from '@/contexts/SessionContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { HomePage as HomePageContent } from '@/components/dashboard/HomePage';
import { LandingPage } from '@/components/dashboard/LandingPage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const HomePage = () => {
  const { user, loading } = useSessionContext();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return <LandingPage />;
  }

  // Show authenticated home page
  return (
    <AuthGuard>
      <HomePageContent />
    </AuthGuard>
  );
};

export default HomePage;
