
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
    if (!loading) {
      if (user) {
        const userRole = user.user_metadata?.user_type;
        
        if (userRole !== requiredRole) {
          console.log(`Role mismatch: User is ${userRole}, but route requires ${requiredRole}`);
          toast.error(`Unauthorized access. This area is for ${requiredRole}s only.`);
          
          // Redirect to the appropriate portal based on user's actual role
          if (userRole === 'trustee') {
            navigate('/crm', { replace: true });
          } else if (userRole === 'client') {
            navigate('/client-portal', { replace: true });
          } else {
            // If role is unknown, redirect to login path provided
            navigate(redirectPath, { replace: true });
          }
        } else {
          console.log(`Role verified: User is ${userRole}, matching required role ${requiredRole}`);
        }
      } else {
        // Not authenticated, redirect to the correct login page
        console.log(`User not authenticated, redirecting to ${redirectPath}`);
        navigate(redirectPath, { replace: true });
      }
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
