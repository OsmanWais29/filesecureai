
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
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
  
  const { user, session, loading: authLoading, signOut } = useAuthState();
  const { role, loading: roleLoading, isClient: isUserClient } = useUserRole();

  const isLoading = authLoading || roleLoading;

  console.log('ClientPortal state:', {
    user: user?.email,
    userType: user?.user_metadata?.user_type,
    role,
    isUserClient,
    loading: isLoading,
    pathname: location.pathname
  });

  // Strict authentication and role checking
  useEffect(() => {
    if (!isLoading) {
      console.log("ClientPortal: Auth state loaded", { 
        hasUser: !!user, 
        hasSession: !!session,
        userType: user?.user_metadata?.user_type,
        role,
        isUserClient
      });
      
      // If no session, redirect to client login
      if (!session || !user) {
        console.log("ClientPortal: No session, redirecting to client login");
        navigate('/client-login', { replace: true });
        return;
      }

      // Strict role checking - only clients can access client portal
      const userType = user.user_metadata?.user_type;
      
      if (userType === 'trustee') {
        console.log("ClientPortal: Trustee account detected, denying access");
        toast.error("Access denied. Trustee accounts cannot access the client portal.");
        navigate('/login', { replace: true });
        return;
      }

      if (role && !isUserClient) {
        console.log("ClientPortal: User doesn't have client role:", role);
        toast.error("Access denied. This portal is for clients only.");
        navigate('/login', { replace: true });
        return;
      }

      console.log("ClientPortal: User authenticated and has correct role");
    }
  }, [user, session, role, isLoading, isUserClient, navigate]);

  // Handler for signing out
  const handleSignOut = async () => {
    try {
      console.log("ClientPortal: Signing out user");
      await signOut();
      navigate('/client-login', { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      setError(error instanceof Error ? error : new Error("Failed to sign out"));
    }
  };

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading client portal...</p>
        </div>
      </div>
    );
  }

  // Handle auth errors
  if (error) {
    return <AuthErrorDisplay error={error instanceof Error ? error.message : String(error)} />;
  }

  // If not authenticated, redirect to client login
  if (!session || !user) {
    navigate('/client-login', { replace: true });
    return null;
  }

  // Check if user has client role (strict enforcement)
  const userType = user.user_metadata?.user_type;
  if (userType === 'trustee' || (role && !isUserClient)) {
    navigate('/login', { replace: true });
    return null;
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
