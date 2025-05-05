
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import { Auth } from "@/components/Auth";
import { useAuthState } from "@/hooks/useAuthState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AuthErrorDisplay } from "@/components/auth/AuthErrorDisplay";
import { ClientPortalLayout } from "@/components/client-portal/ClientPortalLayout";
import { toast } from "sonner";

// Import from the client-portal pages folder
import Dashboard from "./client-portal/Dashboard";
import Documents from "./client-portal/Documents";
import Tasks from "./client-portal/Tasks";
import Appointments from "./client-portal/Appointments";
import Support from "./client-portal/Support";
import Settings from "./client-portal/Settings";
import NotFound from "./client-portal/NotFound";

const ClientPortal = () => {
  const [error, setError] = useState<Error | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, session, loading: isLoading, signOut } = useAuthState();

  // Check if user is authenticated and has correct role
  useEffect(() => {
    if (user && !isLoading) {
      const userType = user.user_metadata?.user_type;
      // Redirect trustees to main app if they try to access client portal
      if (userType === 'trustee') {
        toast.error("Trustee accounts cannot access the client portal");
        navigate('/', { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  // Handler for signing out
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/client-portal', { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      setError(error instanceof Error ? error : new Error("Failed to sign out"));
    }
  };

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle auth errors
  if (error) {
    return <AuthErrorDisplay error={error instanceof Error ? error.message : String(error)} />;
  }

  // If not authenticated, show client portal auth component
  if (!session) {
    return <Auth isClientPortal={true} />;
  }

  // Show client portal dashboard for authenticated clients
  return (
    <ClientPortalLayout onSignOut={handleSignOut}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/support" element={<Support />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ClientPortalLayout>
  );
};

export default ClientPortal;
