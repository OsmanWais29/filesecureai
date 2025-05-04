
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import { Auth } from "@/components/Auth";
import { useAuthState } from "@/hooks/useAuthState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AuthErrorDisplay } from "@/components/auth/AuthErrorDisplay";
import { ClientPortalLayout } from "@/components/client-portal/ClientPortalLayout";
import { ClientDashboard } from "@/components/client-portal/ClientDashboard";
import { ClientDocuments } from "@/components/client-portal/ClientDocuments";
import { ClientTasks } from "@/components/client-portal/ClientTasks";

// Create basic components for the client portal pages
const AppointmentsPage = () => (
  <div className="p-4 md:p-6 w-full">
    <h1 className="text-2xl font-bold mb-4">Appointments</h1>
    <p className="text-muted-foreground mb-6">View and manage your scheduled appointments.</p>
    <div className="bg-muted rounded-lg p-8 text-center">
      <p>Appointments panel coming soon. Your meetings will be scheduled here.</p>
    </div>
  </div>
);

const MessagesPage = () => (
  <div className="p-4 md:p-6 w-full">
    <h1 className="text-2xl font-bold mb-4">Messages</h1>
    <p className="text-muted-foreground mb-6">Communicate securely with your trustee and support team.</p>
    <div className="bg-muted rounded-lg p-8 text-center">
      <p>Messages panel coming soon. Your communications will appear here.</p>
    </div>
  </div>
);

const SupportPage = () => (
  <div className="p-4 md:p-6 w-full">
    <h1 className="text-2xl font-bold mb-4">Support</h1>
    <p className="text-muted-foreground mb-6">Get help with your case or technical issues.</p>
    <div className="bg-muted rounded-lg p-8 text-center">
      <p>Support panel coming soon. You'll be able to submit and track support requests here.</p>
    </div>
  </div>
);

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center p-4 md:p-6">
    <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
    <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist or has been moved.</p>
    <button 
      className="bg-primary text-primary-foreground px-4 py-2 rounded"
      onClick={() => window.location.href = "/client-portal"}
    >
      Return to Dashboard
    </button>
  </div>
);

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
        <Route path="/documents" element={<ClientDocuments />} />
        <Route path="/tasks" element={<ClientTasks />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ClientPortalLayout>
  );
};

export default ClientPortal;
