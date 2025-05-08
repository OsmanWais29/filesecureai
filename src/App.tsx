
import { Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import ClientPortal from "./pages/ClientPortal";
import { AuthRoleGuard } from "./components/auth/AuthRoleGuard";

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
  return (
    <Routes>
      {/* Public routes - accessible without authentication */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Index />} />

      {/* Trustee-only routes - protected with role guard */}
      <Route path="/trustee/dashboard" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <CRMPage />
        </AuthRoleGuard>
      } />
      <Route path="/crm" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <CRMPage />
        </AuthRoleGuard>
      } />
      <Route path="/documents" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <DocumentsPage />
        </AuthRoleGuard>
      } />
      <Route path="/document-viewer/:documentId" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <DocumentViewerPage />
        </AuthRoleGuard>
      } />
      <Route path="/client-viewer/:clientId" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <ClientViewerPage />
        </AuthRoleGuard>
      } />
      <Route path="/calendar-fullscreen" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <CalendarFullscreenPage />
        </AuthRoleGuard>
      } />
      <Route path="/activity" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <ActivityPage />
        </AuthRoleGuard>
      } />
      <Route path="/analytics" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <AnalyticsPage />
        </AuthRoleGuard>
      } />
      <Route path="/converter" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <ConverterPage />
        </AuthRoleGuard>
      } />
      <Route path="/e-filing" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <EFilingPage />
        </AuthRoleGuard>
      } />
      <Route path="/notifications" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <NotificationsPage />
        </AuthRoleGuard>
      } />
      <Route path="/profile" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <ProfilePage />
        </AuthRoleGuard>
      } />
      <Route path="/settings" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <SettingsPage />
        </AuthRoleGuard>
      } />
      <Route path="/support" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <Support />
        </AuthRoleGuard>
      } />
      <Route path="/support/new" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <NewSupportTicket />
        </AuthRoleGuard>
      } />
      <Route path="/support/post/:postId" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <SupportPostDetail />
        </AuthRoleGuard>
      } />
      <Route path="/meetings" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <MeetingsPage />
        </AuthRoleGuard>
      } />
      <Route path="/SAFA" element={
        <AuthRoleGuard requiredRole="trustee" redirectPath="/client-portal">
          <SAFAPage />
        </AuthRoleGuard>
      } />

      {/* Client portal routes - use the ClientPortal layout with role guard */}
      <Route path="/client-portal/*" element={
        <AuthRoleGuard requiredRole="client" redirectPath="/">
          <ClientPortal />
        </AuthRoleGuard>
      } />
      
      <Route path="/client/portal/*" element={
        <AuthRoleGuard requiredRole="client" redirectPath="/">
          <ClientPortal />
        </AuthRoleGuard>
      } />

      {/* 404 catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
