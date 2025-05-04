
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import { Auth } from "@/components/Auth";
import { useAuthState } from "@/hooks/useAuthState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AuthErrorDisplay } from "@/components/auth/AuthErrorDisplay";
import { ClientPortalLayout } from "@/components/client-portal/ClientPortalLayout";

// Import from the new client-portal pages folder
import Dashboard from "./client-portal/Dashboard";
import Documents from "./client-portal/Documents";
import Tasks from "./client-portal/Tasks";
import Appointments from "./client-portal/Appointments";
import Messages from "./client-portal/Messages";
import Support from "./client-portal/Support";
import NotFound from "./client-portal/NotFound";

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
        <Route path="/" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ClientPortalLayout>
  );
};

export default ClientPortal;
