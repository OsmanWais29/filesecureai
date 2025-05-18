import { useEffect, useState } from 'react';
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
  const { user, loading, initialized, isTrustee, isClient, subdomain } = useAuthState();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    if (!loading && initialized) {
      setIsValidating(true);
      
      if (!user) {
        // Not authenticated, redirect to the login page
        console.log(`AuthRoleGuard: User not authenticated, redirecting to ${redirectPath}`);
        navigate(redirectPath, { replace: true });
        return;
      }

      // Check if user role matches the required role
      const hasCorrectRole = (requiredRole === 'trustee' && isTrustee) || 
                             (requiredRole === 'client' && isClient);
      
      console.log(`AuthRoleGuard: User role check - Required: ${requiredRole}, Has correct role: ${hasCorrectRole}`);
      
      if (!hasCorrectRole) {
        console.log(`AuthRoleGuard: Role mismatch: User is ${isClient ? 'client' : isTrustee ? 'trustee' : 'unknown'}, but route requires ${requiredRole}`);
        toast.error(`Unauthorized access. This area is for ${requiredRole}s only.`);
        
        // Redirect based on user's actual role and subdomain
        if (isTrustee) {
          // If user is trustee but on client subdomain, redirect to trustee subdomain
          if (subdomain === 'client') {
            console.log("AuthRoleGuard: Redirecting trustee from client subdomain to trustee subdomain");
            const hostname = window.location.hostname;
            if (hostname === 'localhost') {
              window.location.href = window.location.origin + '?subdomain=trustee';
              return;
            } else {
              const hostParts = hostname.split('.');
              if (hostParts.length > 2) {
                hostParts[0] = 'trustee';
                window.location.href = `https://${hostParts.join('.')}`;
                return;
              }
            }
          }
          // Otherwise, just redirect to trustee dashboard
          console.log("AuthRoleGuard: Redirecting trustee to CRM dashboard");
          navigate('/crm', { replace: true });
        } else if (isClient) {
          // If user is client but on trustee subdomain, redirect to client subdomain
          if (subdomain !== 'client') {
            console.log("AuthRoleGuard: Redirecting client from trustee subdomain to client subdomain");
            const hostname = window.location.hostname;
            if (hostname === 'localhost') {
              window.location.href = window.location.origin + '?subdomain=client';
              return;
            } else {
              const hostParts = hostname.split('.');
              if (hostParts.length > 2) {
                hostParts[0] = 'client';
                window.location.href = `https://${hostParts.join('.')}`;
                return;
              } else {
                window.location.href = `https://client.${hostname}`;
                return;
              }
            }
          }
          // Otherwise, just redirect to client portal
          console.log("AuthRoleGuard: Redirecting client to client portal");
          navigate('/portal', { replace: true });
        } else {
          // If role is unknown, redirect to login path provided
          console.log("AuthRoleGuard: User role unknown, redirecting to login");
          navigate(redirectPath, { replace: true });
        }
        return;
      }
      
      console.log(`AuthRoleGuard: Role verified: User is ${requiredRole}`);
      setIsValidating(false);
    }
  }, [user, loading, requiredRole, redirectPath, navigate, subdomain, initialized, isTrustee, isClient]);

  if (loading || isValidating) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner />
        <p className="ml-2 text-muted-foreground">
          {isValidating ? 'Verifying access...' : 'Loading...'}
        </p>
      </div>
    );
  }

  // Only render children if user has correct role
  return <>{children}</>;
};
