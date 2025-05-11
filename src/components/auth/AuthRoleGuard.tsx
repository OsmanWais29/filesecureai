
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

// Helper function to detect subdomain
const getSubdomain = (): string | null => {
  const hostParts = window.location.hostname.split('.');
  
  // For localhost testing
  if (hostParts.includes('localhost')) {
    const urlParams = new URLSearchParams(window.location.search);
    const subdomain = urlParams.get('subdomain');
    return subdomain;
  }
  
  // For actual domain with subdomains
  if (hostParts.length > 2) {
    return hostParts[0];
  }
  
  return null;
};

export const AuthRoleGuard = ({ 
  children, 
  requiredRole, 
  redirectPath 
}: AuthRoleGuardProps) => {
  const { user, loading } = useAuthState();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  // Detect subdomain on mount
  useEffect(() => {
    const detectedSubdomain = getSubdomain();
    setSubdomain(detectedSubdomain);
  }, []);

  useEffect(() => {
    if (!loading) {
      setIsValidating(true);
      
      if (user) {
        const userRole = user.user_metadata?.user_type;
        console.log(`Checking user role: ${userRole} against required role: ${requiredRole}`);
        
        // Check if user role matches the required role
        if (userRole !== requiredRole) {
          console.log(`Role mismatch: User is ${userRole}, but route requires ${requiredRole}`);
          toast.error(`Unauthorized access. This area is for ${requiredRole}s only.`);
          
          // Redirect based on user's actual role and subdomain
          if (userRole === 'trustee') {
            // If user is trustee but on client subdomain, redirect to trustee subdomain
            if (subdomain === 'client') {
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
            navigate('/crm', { replace: true });
          } else if (userRole === 'client') {
            // If user is client but on trustee subdomain, redirect to client subdomain
            if (subdomain !== 'client') {
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
            navigate('/portal', { replace: true });
          } else {
            // If role is unknown, redirect to login path provided
            navigate(redirectPath, { replace: true });
          }
        } else {
          console.log(`Role verified: User is ${userRole}, matching required role ${requiredRole}`);
          setIsValidating(false);
        }
      } else {
        // Not authenticated, redirect to the correct login page based on subdomain
        console.log(`User not authenticated, redirecting to ${redirectPath}`);
        navigate(redirectPath, { replace: true });
      }
    }
  }, [user, loading, requiredRole, redirectPath, navigate, subdomain]);

  if (loading || isValidating) {
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
