
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, isTrustee, isClient } = useAuthState();

  useEffect(() => {
    // If user is authenticated as trustee, redirect to CRM
    if (!loading && user && isTrustee) {
      navigate('/crm', { replace: true });
    }
    // If user is authenticated as client, redirect to client portal
    else if (!loading && user && isClient) {
      navigate('/client-portal', { replace: true });
    }
    // If not authenticated, redirect to login
    else if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate, isTrustee, isClient]);

  // Show loading while determining where to redirect
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <LoadingSpinner />
      <p className="ml-2 text-muted-foreground">Redirecting to your dashboard...</p>
    </div>
  );
};

export default Index;
