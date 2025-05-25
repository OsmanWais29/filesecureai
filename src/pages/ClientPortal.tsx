
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import { Auth } from "@/components/Auth";
import { useAuthState } from "@/hooks/useAuthState";
import { useUserRole } from "@/hooks/useUserRole";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AuthErrorDisplay } from "@/components/auth/AuthErrorDisplay";
import { ClientPortalLayout } from "@/components/client-portal/ClientPortalLayout";
import { toast } from "sonner";

// Import client portal pages
import { ClientDashboard } from "@/pages/client-portal/Dashboard";
import { ClientDocuments } from "@/pages/client-portal/Documents";
import { ClientTasks } from "@/components/client-portal/ClientTasks";
import { ClientAppointments } from "@/pages/client-portal/Appointments";
import { ClientSupport } from "@/pages/client-portal/Support";
import { ClientSettings } from "@/pages/client-portal/Settings";

const ClientPortal = () => {
  const [error, setError] = useState<Error | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, session, loading: authLoading, signOut, isClient } = useAuthState();
  const { role, loading: roleLoading, isClient: isUserClient } = useUserRole();

  const isLoading = authLoading || roleLoading;

  console.log('ClientPortal state:', {
    user: user?.email,
    role,
    isClient,
    isUserClient,
    loading: isLoading,
    pathname: location.pathname
  });

  // Check authentication and role
  useEffect(() => {
    if (!isLoading) {
      console.log("ClientPortal: Auth state loaded", { 
        hasUser: !!user, 
        hasSession: !!session,
        role,
        isClient,
        isUserClient
      });
      
      // If no session, show auth
      if (!session || !user) {
        console.log("ClientPortal: No session, will show Auth component");
        return;
      }

      // Check if user has appropriate role
      if (role && !isUserClient) {
        console.log("ClientPortal: User doesn't have client role:", role);
        toast.error("Access denied. This portal is for clients only.");
        return;
      }

      console.log("ClientPortal: User authenticated and has correct role");
    }
  }, [user, session, role, isLoading, isClient, isUserClient]);

  // Handler for signing out
  const handleSignOut = async () => {
    try {
      console.log("ClientPortal: Signing out user");
      await signOut();
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
  if (!session || !user) {
    console.log("ClientPortal: No session, showing Auth component");
    return <Auth isClientPortal={true} />;
  }

  // Check if user has client role (allow access if role is not yet loaded)
  if (role && !isUserClient) {
    console.log("ClientPortal: User doesn't have client role:", role);
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            This portal is for clients only.
          </p>
          <button 
            onClick={handleSignOut}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Show client portal dashboard for authenticated clients
  console.log("ClientPortal: Rendering client portal layout");
  return (
    <ClientPortalLayout onSignOut={handleSignOut}>
      <Routes>
        <Route path="/" element={<ClientDashboard />} />
        <Route path="/documents" element={<ClientDocuments />} />
        <Route path="/tasks" element={<ClientTasks />} />
        <Route path="/appointments" element={<ClientAppointments />} />
        <Route path="/support" element={<ClientSupport />} />
        <Route path="/settings" element={<ClientSettings />} />
      </Routes>
    </ClientPortalLayout>
  );
};

export default ClientPortal;
