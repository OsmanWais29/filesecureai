
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from '@/hooks/useAuthState';
import { useUserRole } from '@/hooks/useUserRole';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AuthRoleGuardProps {
  children: React.ReactNode;
  requiredRole: 'trustee' | 'client';
  redirectPath: string;
}

export const AuthRoleGuard = ({ children, requiredRole, redirectPath }: AuthRoleGuardProps) => {
  const { user, loading: authLoading, portal } = useAuthState();
  const { role, loading: roleLoading, isClient, isTrustee } = useUserRole();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const isLoading = authLoading || roleLoading;

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setShouldRedirect(true);
        return;
      }

      const hasCorrectRole = requiredRole === 'client' ? isClient : isTrustee;
      
      if (role && !hasCorrectRole) {
        setShouldRedirect(true);
      }
    }
  }, [user, role, isClient, isTrustee, requiredRole, isLoading]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (shouldRedirect || !user) {
    return <Navigate to={redirectPath} replace />;
  }

  if (role && requiredRole === 'client' && !isClient) {
    return <Navigate to="/login" replace />;
  }

  if (role && requiredRole === 'trustee' && !isTrustee) {
    return <Navigate to="/client-login" replace />;
  }

  return <>{children}</>;
};
