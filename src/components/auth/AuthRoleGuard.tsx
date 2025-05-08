
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from '@/hooks/useAuthState';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AuthRoleGuardProps {
  children: React.ReactNode;
  requiredRole: 'trustee' | 'client';
  redirectPath: string;
}

export const AuthRoleGuard = ({ 
  children, 
  requiredRole, 
  redirectPath 
}: AuthRoleGuardProps) => {
  const { user, loading } = useAuthState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      const userRole = user.user_metadata?.user_type;
      
      if (userRole !== requiredRole) {
        toast.error(`Unauthorized access. This area is for ${requiredRole}s only.`);
        navigate(redirectPath, { replace: true });
      }
    } else if (!loading && !user) {
      // Not authenticated
      const loginPath = requiredRole === 'trustee' ? '/' : '/client-portal';
      navigate(loginPath, { replace: true });
    }
  }, [user, loading, requiredRole, redirectPath, navigate]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Only render children if user has correct role
  if (!user || user.user_metadata?.user_type !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};
