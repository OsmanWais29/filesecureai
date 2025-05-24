
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { AuthRoleGuard } from "./components/auth/AuthRoleGuard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { recordSessionEvent, logRoutingEvent } from "@/utils/debugMode";
import { authDebug } from "@/utils/authDebug";

// Auth Pages
import TrusteeLogin from "./pages/auth/TrusteeLogin";
import ClientLogin from "./pages/auth/ClientLogin";

// Client Portal Pages
import ClientPortal from "./pages/ClientPortal";

// Trustee Pages
import Index from "./pages/trustee/Index";
import CRMPage from "./pages/trustee/CRMPage";
import DocumentsPage from "./pages/trustee/DocumentsPage";
import DocumentViewerPage from "./pages/trustee/DocumentViewerPage";
import ClientViewerPage from "./pages/trustee/ClientViewerPage";
import CalendarFullscreenPage from "./pages/trustee/CalendarFullscreenPage";
import ActivityPage from "./pages/trustee/ActivityPage";
import AnalyticsPage from "./pages/trustee/AnalyticsPage";
import EFilingPage from "./pages/trustee/EFilingPage";
import ProfilePage from "./pages/trustee/ProfilePage";
import Support from "./pages/trustee/Support"; 
import NewSupportTicket from "./pages/NewSupportTicket";
import SupportPostDetail from "./pages/SupportPostDetail";
import SettingsPage from "./pages/trustee/SettingsPage";
import NotificationsPage from "./pages/trustee/NotificationsPage";
import ConBrandingPage from "./pages/trustee/ConBrandingPage";
import ConverterPage from "./pages/trustee/ConverterPage";
import MeetingsPage from "./pages/MeetingsPage";
import SAFAPage from "./pages/SAFA/SAFAPage";
import NotFound from "./pages/NotFound";

import "./App.css";

// Improved home page resolver that respects authentication status
function HomePageResolver() {
  const { user, loading, isClient, isTrustee, subdomain } = useAuthState();
  
  useEffect(() => {
    logRoutingEvent(`HomePageResolver: Initialized with user: ${!!user}, isClient: ${isClient}, isTrustee: ${isTrustee}, subdomain: ${subdomain}`);
    recordSessionEvent('home_page_resolver_initialized');
    
    // Diagnostics to check auth state
    authDebug.checkAuthState().then(state => {
      logRoutingEvent(`HomePageResolver diagnostics: ${JSON.stringify(state)}`);
    });
  }, [user, isClient, isTrustee, subdomain]);
  
  // Prevent multiple renders/redirects while checking auth
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-muted-foreground">
          Loading authentication state...
        </p>
      </div>
    );
  }

  // User is authenticated
  if (user) {
    // If client, redirect to client portal
    if (isClient) {
      logRoutingEvent("HomePageResolver: User is client, redirecting to /portal");
      recordSessionEvent('home_resolver_redirect_client_to_portal');
      return <Navigate to="/portal" replace />;
    }
    
    // If trustee, redirect to CRM
    if (isTrustee) {
      logRoutingEvent("HomePageResolver: User is trustee, redirecting to /crm");
      recordSessionEvent('home_resolver_redirect_trustee_to_crm');
      return <Navigate to="/crm" replace />;
    }
    
    logRoutingEvent(`HomePageResolver: User role not recognized: ${user.user_metadata?.user_type}`);
    recordSessionEvent('home_resolver_unrecognized_role');
    // If user role is not recognized, go to login
    return <Navigate to="/login" replace />;
  }
  
  logRoutingEvent("HomePageResolver: No authenticated user, redirecting to /login");
  recordSessionEvent('home_resolver_redirect_to_login');
  // Not authenticated, go to login
  return <Navigate to="/login" replace />;
}

function App() {
  const { subdomain, isClient, loading } = useAuthState();
  
  useEffect(() => {
    logRoutingEvent(`App: Current subdomain detected: ${subdomain}`);
    logRoutingEvent(`App: Is client subdomain: ${isClient}`);
    recordSessionEvent(`app_rendered_with_subdomain_${subdomain || 'none'}`);
  }, [subdomain, isClient]);

  useEffect(() => {
    // Auto-check auth state on mount
    authDebug.checkAuthState();
  }, []);

  // Show loading state while determining subdomain
  if (loading && subdomain === null) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-muted-foreground">Detecting application context...</p>
      </div>
    );
  }
  
  // If subdomain is 'client', show client routes
  if (isClient) {
    logRoutingEvent("App: Rendering client routes for client subdomain");
    recordSessionEvent('app_rendering_client_routes');
    return (
      <Routes>
        {/* Root route - redirects based on auth status */}
        <Route path="/" element={<HomePageResolver />} />
        
        {/* Client login route */}
        <Route path="/login" element={<ClientLogin />} />
        
        {/* Client portal routes - use the ClientPortal layout with role guard */}
        <Route path="/client-portal/*" element={
          <AuthRoleGuard requiredRole="client" redirectPath="/login">
            <ClientPortal />
          </AuthRoleGuard>
        } />
        
        {/* Alternative path for the portal */}
        <Route path="/portal/*" element={
          <AuthRoleGuard requiredRole="client" redirectPath="/login">
            <ClientPortal />
          </AuthRoleGuard>
        } />
        
        {/* Redirect any attempt to access trustee routes */}
        <Route path="/crm" element={<Navigate to="/login" replace />} />
        <Route path="/trustee/*" element={<Navigate to="/login" replace />} />
        <Route path="/documents" element={<Navigate to="/login" replace />} />
        
        {/* 404 catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }
  
  // For trustee routes:
  logRoutingEvent("App: Rendering trustee routes for trustee subdomain");
  recordSessionEvent('app_rendering_trustee_routes');
  return (
    <Routes>
      {/* Root route - redirects based on auth status */}
      <Route path="/" element={<HomePageResolver />} />
      
      {/* Separate login routes for trustee */}
      <Route path="/login" element={<TrusteeLogin />} />
      
      {/* Redirect client login attempts on trustee subdomain */}
      <Route path="/client-login" element={<Navigate to="/login" replace />} />
      <Route path="/client-portal/*" element={<Navigate to="/login" replace />} />
      <Route path="/portal/*" element={<Navigate to="/login" replace />} />

      {/* Trustee-only routes - protected with role guard */}
      <Route path="/crm" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <CRMPage />
        </AuthRoleGuard>
      } />
      <Route path="/trustee/dashboard" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <Index />
        </AuthRoleGuard>
      } />
      <Route path="/documents" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <DocumentsPage />
        </AuthRoleGuard>
      } />
      <Route path="/document/:id" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <DocumentViewerPage />
        </AuthRoleGuard>
      } />
      <Route path="/client/:id" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <ClientViewerPage />
        </AuthRoleGuard>
      } />
      <Route path="/calendar" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <CalendarFullscreenPage />
        </AuthRoleGuard>
      } />
      <Route path="/activity" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <ActivityPage />
        </AuthRoleGuard>
      } />
      <Route path="/analytics" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <AnalyticsPage />
        </AuthRoleGuard>
      } />
      <Route path="/e-filing" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <EFilingPage />
        </AuthRoleGuard>
      } />
      <Route path="/profile" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <ProfilePage />
        </AuthRoleGuard>
      } />
      <Route path="/support" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <Support />
        </AuthRoleGuard>
      } />
      <Route path="/support/new" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <NewSupportTicket />
        </AuthRoleGuard>
      } />
      <Route path="/support/post/:id" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <SupportPostDetail />
        </AuthRoleGuard>
      } />
      <Route path="/settings" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <SettingsPage />
        </AuthRoleGuard>
      } />
      <Route path="/notifications" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <NotificationsPage />
        </AuthRoleGuard>
      } />
      <Route path="/con-branding" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <ConBrandingPage />
        </AuthRoleGuard>
      } />
      <Route path="/converter" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <ConverterPage />
        </AuthRoleGuard>
      } />
      <Route path="/meetings" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <MeetingsPage />
        </AuthRoleGuard>
      } />
      <Route path="/safa" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <SAFAPage />
        </AuthRoleGuard>
      } />
      
      {/* 404 catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
