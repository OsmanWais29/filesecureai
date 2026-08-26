
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { useUserRole } from "@/hooks/useUserRole";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AuthErrorDisplay } from "@/components/auth/AuthErrorDisplay";
import { ClientPortalLayout } from "@/components/client-portal/ClientPortalLayout";
import { toast } from "sonner";
import { usePreviewSession, useMyPortalAccess, recordPortalLogin } from "@/data/clientPortal/invitations";

// Import client portal pages
import { ClientDashboard } from "@/pages/client-portal/Dashboard";
import { ClientDocuments } from "@/pages/client-portal/Documents";
import { ClientTasksPage } from "@/pages/client-portal/Tasks";
import { ClientInformation } from "@/pages/client-portal/Information";
import { ClientBanking } from "@/pages/client-portal/Banking";
import { ClientIncome } from "@/pages/client-portal/Income";
import { ClientMessages } from "@/pages/client-portal/Messages";
import { ClientAppointments } from "@/pages/client-portal/Appointments";
import { ClientSupport } from "@/pages/client-portal/Support";
import { ClientSettings } from "@/pages/client-portal/Settings";


const ClientPortal = () => {
  const [error, setError] = useState<Error | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, session, loading: authLoading, signOut } = useAuthState();
  const { role, loading: roleLoading, isClient: isUserClient } = useUserRole();
  const previewSession = usePreviewSession();
  const { loading: accessLoading, estateIds } = useMyPortalAccess();

  useEffect(() => {
    if (user) void recordPortalLogin();
  }, [user]);

  const isLoading = (authLoading || roleLoading) && !previewSession;

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
    if (previewSession) return;
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
  }, [user, session, role, isLoading, isUserClient, navigate, previewSession]);

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
  if (!previewSession && (!session || !user)) {
    navigate('/client-login', { replace: true });
    return null;
  }

  // Check if user has client role (strict enforcement)
  const userType = user?.user_metadata?.user_type;
  if (!previewSession && (userType === 'trustee' || (role && !isUserClient))) {
    navigate('/login', { replace: true });
    return null;
  }

  // Authenticated client with no estate granted yet.
  if (!previewSession && user && !accessLoading && estateIds.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold">No file connected yet</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your account is ready, but it is not linked to a file yet. Open the secure invitation your trustee sent you
            to connect your account. If you have not received one, contact your trustee's office.
          </p>
          <button
            className="mt-6 text-sm text-primary underline-offset-2 hover:underline"
            onClick={handleSignOut}
          >
            Sign out
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
        <Route index element={<ClientDashboard />} />
        <Route path="documents" element={<ClientDocuments />} />
        <Route path="information" element={<ClientInformation />} />
        <Route path="tasks" element={<ClientTasksPage />} />

        <Route path="banking" element={<ClientBanking />} />
        <Route path="income" element={<ClientIncome />} />
        <Route path="messages" element={<ClientMessages />} />
        <Route path="appointments" element={<ClientAppointments />} />
        <Route path="support" element={<ClientSupport />} />
        <Route path="settings" element={<ClientSettings />} />
      </Routes>
    </ClientPortalLayout>
  );
};

export default ClientPortal;
