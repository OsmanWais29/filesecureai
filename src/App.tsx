
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

// Simplified home page resolver
function HomePageResolver() {
  const { user, loading, isClient, isTrustee } = useAuthState();
  
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // User is authenticated
  if (user) {
    // If on client portal paths, redirect to client portal
    if (isClient) {
      return <Navigate to="/client-portal" replace />;
    }
    
    // If trustee, show the main dashboard
    if (isTrustee) {
      return <Index />;
    }
  }
  
  // Not authenticated, go to appropriate login
  if (isClient) {
    return <Navigate to="/client-login" replace />;
  }
  
  return <Navigate to="/login" replace />;
}

function App() {
  const { portal, loading } = useAuthState();
  
  useEffect(() => {
    logRoutingEvent(`App: Current portal detected: ${portal}`);
    recordSessionEvent(`app_rendered_with_portal_${portal || 'none'}`);
  }, [portal]);

  useEffect(() => {
    authDebug.checkAuthState();
  }, []);

  // Show loading state while determining portal
  if (loading && portal === null) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-muted-foreground">Loading application...</p>
      </div>
    );
  }
  
  return (
    <Routes>
      {/* Home route */}
      <Route path="/" element={<HomePageResolver />} />
      
      {/* Authentication routes */}
      <Route path="/login" element={<TrusteeLogin />} />
      <Route path="/trustee-login" element={<TrusteeLogin />} />
      <Route path="/client-login" element={<ClientLogin />} />
      
      {/* Client Portal routes */}
      <Route path="/client-portal/*" element={
        <AuthRoleGuard requiredRole="client" redirectPath="/client-login">
          <ClientPortal />
        </AuthRoleGuard>
      } />

      {/* Trustee-only routes */}
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
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
