
import { Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import ClientPortal from "./pages/ClientPortal";
import { AuthRoleGuard } from "./components/auth/AuthRoleGuard";
import TrusteeLogin from "./pages/auth/TrusteeLogin";
import ClientLogin from "./pages/auth/ClientLogin";
import { useEffect } from "react";
import { useAuthState, getSubdomain } from "@/hooks/useAuthState";

// Import from the trustee folder
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
import Support from "./pages/Support"; 
import NewSupportTicket from "./pages/NewSupportTicket";
import SupportPostDetail from "./pages/SupportPostDetail";
import SettingsPage from "./pages/trustee/SettingsPage";
import NotificationsPage from "./pages/trustee/NotificationsPage";
import ConBrandingPage from "./pages/trustee/ConBrandingPage";
import ConverterPage from "./pages/trustee/ConverterPage";
import MeetingsPage from "./pages/MeetingsPage";
import SAFAPage from "./pages/SAFA/SAFAPage";

import "./App.css";

function App() {
  const { subdomain } = useAuthState();
  
  useEffect(() => {
    console.log("App: Current subdomain detected:", subdomain);
  }, [subdomain]);
  
  // If subdomain is 'client', show client routes
  if (subdomain === 'client') {
    console.log("App: Rendering client routes for client subdomain");
    return (
      <Routes>
        {/* Client routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
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
  
  // If subdomain is 'trustee' or null, show trustee routes (default)
  console.log("App: Rendering trustee routes for trustee subdomain");
  return (
    <Routes>
      {/* Root route now redirects to appropriate login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
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
          <CRMPage />
        </AuthRoleGuard>
      } />
      <Route path="/documents" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <DocumentsPage />
        </AuthRoleGuard>
      } />
      <Route path="/document-viewer/:documentId" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <DocumentViewerPage />
        </AuthRoleGuard>
      } />
      <Route path="/client-viewer/:clientId" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <ClientViewerPage />
        </AuthRoleGuard>
      } />
      <Route path="/calendar-fullscreen" element={
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
      <Route path="/converter" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <ConverterPage />
        </AuthRoleGuard>
      } />
      <Route path="/e-filing" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <EFilingPage />
        </AuthRoleGuard>
      } />
      <Route path="/notifications" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <NotificationsPage />
        </AuthRoleGuard>
      } />
      <Route path="/profile" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <ProfilePage />
        </AuthRoleGuard>
      } />
      <Route path="/settings" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <SettingsPage />
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
      <Route path="/support/:postId" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <SupportPostDetail />
        </AuthRoleGuard>
      } />
      <Route path="/meetings" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
          <MeetingsPage />
        </AuthRoleGuard>
      } />
      <Route path="/SAFA" element={
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
