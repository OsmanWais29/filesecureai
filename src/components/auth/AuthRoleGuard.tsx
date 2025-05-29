
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
  const { user, loading: authLoading } = useAuthState();
  const { role, loading: roleLoading, isClient, isTrustee } = useUserRole();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const isLoading = authLoading || roleLoading;

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setShouldRedirect(true);
        return;
      }

      // Strict role enforcement - no cross-portal access
      const hasCorrectRole = requiredRole === 'client' ? isClient : isTrustee;
      
      if (role && !hasCorrectRole) {
        console.log(`AuthRoleGuard: User role ${role} does not match required role ${requiredRole}`);
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

  // Additional security check - redirect clients trying to access trustee routes
  if (role && requiredRole === 'trustee' && isClient) {
    console.log("AuthRoleGuard: Client attempting to access trustee portal, redirecting");
    return <Navigate to="/client-login" replace />;
  }

  // Additional security check - redirect trustees trying to access client routes
  if (role && requiredRole === 'client' && isTrustee) {
    console.log("AuthRoleGuard: Trustee attempting to access client portal, redirecting");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
