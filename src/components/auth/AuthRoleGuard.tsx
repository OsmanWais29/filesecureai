import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from '@/hooks/useAuthState';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { authDebug } from '@/utils/authDebug';
import { logAuthEvent, logRoutingEvent, recordSessionEvent } from '@/utils/debugMode';

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
  const [validationStartTime] = useState(Date.now());

  // Log route attempt
  useEffect(() => {
    logRoutingEvent(`AuthRoleGuard: Access attempt to protected route ${location.pathname}, required role: ${requiredRole}`);
    authDebug.logRouteInfo(location.pathname, requiredRole);
    recordSessionEvent(`auth_guard_check_${requiredRole}_${location.pathname}`);
  }, [location.pathname, requiredRole]);

  useEffect(() => {
    // Create a unique ID for this validation cycle to track it in logs
    const validationId = `validation-${Math.random().toString(36).substring(2, 9)}`;
    
    if (!loading && initialized) {
      logAuthEvent(`AuthRoleGuard [${validationId}]: Checking access for route ${location.pathname}, required role: ${requiredRole}`);
      logAuthEvent(`AuthRoleGuard [${validationId}]: User authentication state - logged in: ${!!user}, isTrustee: ${isTrustee}, isClient: ${isClient}`);
      
      // Prevent multiple redirects
      if (isRedirecting) {
        logAuthEvent(`AuthRoleGuard [${validationId}]: Redirect already in progress, skipping check`);
        return;
      }

      setIsValidating(true);
      const validationDuration = Date.now() - validationStartTime;
      logAuthEvent(`AuthRoleGuard [${validationId}]: Validation running for ${validationDuration}ms`);
      
      if (!user) {
        // Not authenticated, redirect to the login page
        logAuthEvent(`AuthRoleGuard [${validationId}]: User not authenticated, redirecting to ${redirectPath}`);
        recordSessionEvent(`auth_guard_unauthenticated_redirect_${location.pathname}`);
        setIsRedirecting(true);
        
        // Delay redirect to prevent flashing
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 150);
        return;
      }

      // Check if user role matches the required role
      const hasCorrectRole = (requiredRole === 'trustee' && isTrustee) || 
                            (requiredRole === 'client' && isClient);
      
      logAuthEvent(`AuthRoleGuard [${validationId}]: User role check - Required: ${requiredRole}, Has correct role: ${hasCorrectRole}`);
      
      if (!hasCorrectRole) {
        setIsRedirecting(true);
        logAuthEvent(`AuthRoleGuard [${validationId}]: Role mismatch: User is ${isClient ? 'client' : isTrustee ? 'trustee' : 'unknown'}, but route requires ${requiredRole}`);
        recordSessionEvent(`auth_guard_role_mismatch_${user?.user_metadata?.user_type}_vs_${requiredRole}`);
        
        // Display error message
        toast.error(`Unauthorized access. This area is for ${requiredRole}s only.`);
        
        // Redirect based on user's actual role and subdomain
        if (isTrustee) {
          // If user is trustee but on client subdomain, redirect to trustee subdomain
          if (subdomain === 'client') {
            logAuthEvent(`AuthRoleGuard [${validationId}]: Redirecting trustee from client subdomain to trustee subdomain`);
            recordSessionEvent('trustee_redirect_from_client_subdomain');
            
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
            }, 150);
            return;
          }
          // Otherwise, just redirect to trustee dashboard
          logAuthEvent(`AuthRoleGuard [${validationId}]: Redirecting trustee to CRM dashboard`);
          recordSessionEvent('trustee_redirect_to_crm');
          setTimeout(() => {
            navigate('/crm', { replace: true });
          }, 150);
        } else if (isClient) {
          // If user is client but on trustee subdomain, redirect to client subdomain
          if (subdomain !== 'client') {
            logAuthEvent(`AuthRoleGuard [${validationId}]: Redirecting client from trustee subdomain to client subdomain`);
            recordSessionEvent('client_redirect_from_trustee_subdomain');
            
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
            }, 150);
            return;
          }
          // Otherwise, just redirect to client portal
          logAuthEvent(`AuthRoleGuard [${validationId}]: Redirecting client to client portal`);
          recordSessionEvent('client_redirect_to_portal');
          setTimeout(() => {
            navigate('/client-portal', { replace: true });
          }, 150);
        } else {
          // If role is unknown, redirect to login path provided
          logAuthEvent(`AuthRoleGuard [${validationId}]: User role unknown, redirecting to login`);
          recordSessionEvent('unknown_role_redirect_to_login');
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 150);
        }
        return;
      }
      
      logAuthEvent(`AuthRoleGuard [${validationId}]: Role verified: User is ${requiredRole}, granting access to ${location.pathname}`);
      recordSessionEvent(`auth_guard_access_granted_${requiredRole}_${location.pathname}`);
      setIsValidating(false);
    }
  }, [user, loading, requiredRole, redirectPath, navigate, subdomain, initialized, isTrustee, isClient, location.pathname, isRedirecting, validationStartTime]);

  if (loading || isValidating) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-muted-foreground">
          {isValidating ? 'Verifying access...' : 'Loading...'}
        </p>
      </div>
    );
  }

  // Only render children if user has correct role
  return <>{children}</>;
};
