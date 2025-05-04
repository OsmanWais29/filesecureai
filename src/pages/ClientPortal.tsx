
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import { Auth } from "@/components/Auth";
import { useAuthState } from "@/hooks/useAuthState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AuthErrorDisplay } from "@/components/auth/AuthErrorDisplay";
import { ClientPortalLayout } from "@/components/client-portal/ClientPortalLayout";
import { ClientDashboard } from "@/components/client-portal/ClientDashboard";

// Import all the client portal pages
import ClientDocumentsPage from "@/pages/client-portal/ClientDocumentsPage";
import ClientTasksPage from "@/pages/client-portal/ClientTasksPage";
import ClientAppointmentsPage from "@/pages/client-portal/ClientAppointmentsPage";
import ClientMessagesPage from "@/pages/client-portal/ClientMessagesPage";
import ClientSupportPage from "@/pages/client-portal/ClientSupportPage";
import ClientProfilePage from "@/pages/client-portal/ClientProfilePage";
import ClientSettingsPage from "@/pages/client-portal/ClientSettingsPage";

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
    <ClientPortalLayout>
      <Routes>
        <Route path="/" element={<ClientDashboard />} />
        <Route path="/documents" element={<ClientDocumentsPage />} />
        <Route path="/tasks" element={<ClientTasksPage />} />
        <Route path="/appointments" element={<ClientAppointmentsPage />} />
        <Route path="/messages" element={<ClientMessagesPage />} />
        <Route path="/support" element={<ClientSupportPage />} />
        <Route path="/profile" element={<ClientProfilePage />} />
        <Route path="/settings" element={<ClientSettingsPage />} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </ClientPortalLayout>
  );
};

export default ClientPortal;
