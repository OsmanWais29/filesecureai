
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Auth } from "@/components/Auth";
import { useAuthState } from "@/hooks/useAuthState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AuthErrorDisplay } from "@/components/auth/AuthErrorDisplay";
import { ClientPortalLayout } from "@/components/client-portal/ClientPortalLayout";
import { ClientDashboard } from "@/components/client-portal/ClientDashboard";

const ClientPortal = () => {
  const [error, setError] = useState<Error | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, session, loading: isLoading } = useAuthState();

  // Check if user is authenticated and has client role
  useEffect(() => {
    if (user && !isLoading) {
      const userType = user.user_metadata?.user_type;
      // Redirect trustees to main app if they try to access client portal
      if (userType === 'trustee') {
        navigate('/', { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Handle auth errors
  if (error) {
    return <AuthErrorDisplay error={error instanceof Error ? error.message : String(error)} />;
  }

  // If not authenticated, show client portal auth component
  if (!session) {
    return <Auth />;
  }

  // Show client portal dashboard for authenticated clients
  return (
    <ClientPortalLayout>
      <ClientDashboard />
    </ClientPortalLayout>
  );
};

export default ClientPortal;
