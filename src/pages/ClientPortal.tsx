
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
  const [isClientSubdomain, setIsClientSubdomain] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, session, loading: isLoading, signOut } = useAuthState();

  // Check if we're on the client subdomain
  useEffect(() => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost';
    
    // For localhost testing
    if (isLocalhost) {
      const urlParams = new URLSearchParams(window.location.search);
      const subdomain = urlParams.get('subdomain');
      const isClient = subdomain === 'client';
      setIsClientSubdomain(isClient);
      console.log("ClientPortal: On localhost with subdomain:", subdomain, "isClient:", isClient);
    } else {
      // For actual domain with subdomains
      const hostParts = hostname.split('.');
      const isClient = hostParts.length > 2 && hostParts[0] === 'client';
      setIsClientSubdomain(isClient);
      console.log("ClientPortal: On production with hostname:", hostname, "isClient:", isClient);
    }
  }, []);

  // Check if user is authenticated and has correct role
  useEffect(() => {
    if (!isLoading) {
      console.log("ClientPortal: Auth state loaded, user:", user?.id, "role:", user?.user_metadata?.user_type);
      
      if (user) {
        const userType = user?.user_metadata?.user_type;
        
        // Redirect trustees to main app if they try to access client portal
        if (userType === 'trustee' && isClientSubdomain) {
          console.log("ClientPortal: Trustee account detected but on client subdomain");
          toast.error("Trustee accounts cannot access the client portal");
          // Redirect to trustee subdomain
          const hostname = window.location.hostname;
          if (hostname === 'localhost') {
            window.location.href = window.location.origin + '?subdomain=trustee';
          } else {
            const hostParts = hostname.split('.');
            if (hostParts.length > 2) {
              hostParts[0] = 'trustee';
              window.location.href = `https://${hostParts.join('.')}`;
            }
          }
        } else if (userType === 'client') {
          console.log("ClientPortal: Authenticated as client, accessing client portal");
        } else {
          console.log("ClientPortal: User has unknown role:", userType);
        }
      } else {
        console.log("ClientPortal: No authenticated user");
      }
    }
  }, [user, isLoading, navigate, isClientSubdomain]);

  // Handler for signing out
  const handleSignOut = async () => {
    try {
      console.log("ClientPortal: Signing out user");
      await signOut();
      navigate('/', { replace: true });
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
    console.log("ClientPortal: No session, showing Auth component");
    return <Auth isClientPortal={true} />;
  }

  // Check if user has client role
  if (user?.user_metadata?.user_type !== 'client') {
    console.log("ClientPortal: User doesn't have client role:", user?.user_metadata?.user_type);
    toast.error("Access denied. This portal is for clients only.");
    return <Auth isClientPortal={true} />;
  }

  // Show client portal dashboard for authenticated clients
  console.log("ClientPortal: Rendering client portal layout");
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
