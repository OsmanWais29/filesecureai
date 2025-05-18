import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && initialized) {
      console.log(`AuthRoleGuard: Checking access for route ${location.pathname}, required role: ${requiredRole}`);
      console.log(`AuthRoleGuard: User authentication state - logged in: ${!!user}, isTrustee: ${isTrustee}, isClient: ${isClient}`);
      
      // Prevent multiple redirects
      if (isRedirecting) {
        return;
      }

      setIsValidating(true);
      
      if (!user) {
        // Not authenticated, redirect to the login page
        console.log(`AuthRoleGuard: User not authenticated, redirecting to ${redirectPath}`);
        setIsRedirecting(true);
        
        // Delay redirect to prevent flashing
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 100);
        return;
      }

      // Check if user role matches the required role
      const hasCorrectRole = (requiredRole === 'trustee' && isTrustee) || 
                            (requiredRole === 'client' && isClient);
      
      console.log(`AuthRoleGuard: User role check - Required: ${requiredRole}, Has correct role: ${hasCorrectRole}`);
      
      if (!hasCorrectRole) {
        setIsRedirecting(true);
        console.log(`AuthRoleGuard: Role mismatch: User is ${isClient ? 'client' : isTrustee ? 'trustee' : 'unknown'}, but route requires ${requiredRole}`);
        
        // Display error message
        toast.error(`Unauthorized access. This area is for ${requiredRole}s only.`);
        
        // Redirect based on user's actual role and subdomain
        if (isTrustee) {
          // If user is trustee but on client subdomain, redirect to trustee subdomain
          if (subdomain === 'client') {
            console.log("AuthRoleGuard: Redirecting trustee from client subdomain to trustee subdomain");
            
            setTimeout(() => {
              const hostname = window.location.hostname;
              if (hostname === 'localhost') {
                window.location.href = window.location.origin + '?subdomain=trustee';
              } else {
                const hostParts = hostname.split('.');
                if (hostParts.length > 2) {
                  hostParts[0] = 'trustee';
                  window.location.href = `https://${hostParts.join('.')}`;
                } else {
                  window.location.href = `https://trustee.${hostname}`;
                }
              }
            }, 100);
            return;
          }
          // Otherwise, just redirect to trustee dashboard
          console.log("AuthRoleGuard: Redirecting trustee to CRM dashboard");
          setTimeout(() => {
            navigate('/crm', { replace: true });
          }, 100);
        } else if (isClient) {
          // If user is client but on trustee subdomain, redirect to client subdomain
          if (subdomain !== 'client') {
            console.log("AuthRoleGuard: Redirecting client from trustee subdomain to client subdomain");
            
            setTimeout(() => {
              const hostname = window.location.hostname;
              if (hostname === 'localhost') {
                window.location.href = window.location.origin + '?subdomain=client';
              } else {
                const hostParts = hostname.split('.');
                if (hostParts.length > 2) {
                  hostParts[0] = 'client';
                  window.location.href = `https://${hostParts.join('.')}`;
                } else {
                  window.location.href = `https://client.${hostname}`;
                }
              }
            }, 100);
            return;
          }
          // Otherwise, just redirect to client portal
          console.log("AuthRoleGuard: Redirecting client to client portal");
          setTimeout(() => {
            navigate('/client-portal', { replace: true });
          }, 100);
        } else {
          // If role is unknown, redirect to login path provided
          console.log("AuthRoleGuard: User role unknown, redirecting to login");
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 100);
        }
        return;
      }
      
      console.log(`AuthRoleGuard: Role verified: User is ${requiredRole}, granting access to ${location.pathname}`);
      setIsValidating(false);
    }
  }, [user, loading, requiredRole, redirectPath, navigate, subdomain, initialized, isTrustee, isClient, location.pathname, isRedirecting]);

  if (loading || isValidating) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">
          {isValidating ? 'Verifying access...' : 'Loading...'}
        </p>
      </div>
    );
  }

  // Only render children if user has correct role
  return <>{children}</>;
};
