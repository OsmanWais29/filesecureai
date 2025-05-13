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
  const { user, loading, initialized } = useAuthState();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  // Detect subdomain on mount
  useEffect(() => {
    const hostname = window.location.hostname;
    
    // For localhost testing
    if (hostname === 'localhost') {
      const urlParams = new URLSearchParams(window.location.search);
      const subdomain = urlParams.get('subdomain');
      setSubdomain(subdomain);
      console.log("AuthRoleGuard: Detected subdomain on localhost:", subdomain);
    }
    // For actual domain with subdomains
    else {
      const hostParts = hostname.split('.');
      if (hostParts.length > 2) {
        setSubdomain(hostParts[0]);
        console.log("AuthRoleGuard: Detected subdomain:", hostParts[0]);
      } else {
        console.log("AuthRoleGuard: No subdomain detected");
      }
    }
  }, []);

  useEffect(() => {
    if (!loading && initialized) {
      setIsValidating(true);
      
      if (user) {
        const userRole = user.user_metadata?.user_type;
        console.log(`AuthRoleGuard: Checking user role: ${userRole} against required role: ${requiredRole}`);
        console.log("AuthRoleGuard: Full user data:", {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata
        });
        
        // Check if user role matches the required role
        if (userRole !== requiredRole) {
          console.log(`AuthRoleGuard: Role mismatch: User is ${userRole}, but route requires ${requiredRole}`);
          toast.error(`Unauthorized access. This area is for ${requiredRole}s only.`);
          
          // Redirect based on user's actual role and subdomain
          if (userRole === 'trustee') {
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
          } else if (userRole === 'client') {
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
        } else {
          console.log(`AuthRoleGuard: Role verified: User is ${userRole}, matching required role ${requiredRole}`);
          setIsValidating(false);
        }
      } else {
        // Not authenticated, redirect to the correct login page based on subdomain
        console.log(`AuthRoleGuard: User not authenticated, redirecting to ${redirectPath}`);
        navigate(redirectPath, { replace: true });
      }
    }
  }, [user, loading, requiredRole, redirectPath, navigate, subdomain, initialized]);

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
  if (!user || user.user_metadata?.user_type !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};
