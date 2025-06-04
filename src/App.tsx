
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TrackingProvider } from './contexts/TrackingContext';
import HomePage from './pages/HomePage';
import DocumentsPage from './pages/DocumentsPage';
import SettingsPage from './pages/SettingsPage';
import ActivityPage from './pages/ActivityPage';
import ClientsPage from './pages/ClientsPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import PublicLayout from './components/layout/PublicLayout';
import DashboardPage from './pages/DashboardPage';
import DocumentViewerPage from './pages/DocumentViewerPage';
import PDFViewerDemo from './pages/PDFViewerDemo';
import TestingPage from "./pages/TestingPage";
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';

// Import trustee pages
import TrusteeIndex from './pages/trustee/Index';
import TrusteeDocumentsPage from './pages/trustee/DocumentsPage';
import TrusteeSettingsPage from './pages/trustee/SettingsPage';
import TrusteeActivityPage from './pages/trustee/ActivityPage';
import TrusteeAnalyticsPage from './pages/trustee/AnalyticsPage';
import TrusteeProfilePage from './pages/trustee/ProfilePage';
import TrusteeCRMPage from './pages/trustee/CRMPage';
import TrusteeDocumentViewerPage from './pages/trustee/DocumentViewerPage';
import TrusteeClientViewerPage from './pages/trustee/ClientViewerPage';
import TrusteeNotificationsPage from './pages/trustee/NotificationsPage';
import TrusteeCalendarPage from './pages/trustee/CalendarFullscreenPage';
import TrusteeConverterPage from './pages/trustee/ConverterPage';
import TrusteeEFilingPage from './pages/trustee/EFilingPage';
import TrusteeSupport from './pages/trustee/Support';
import TrusteeConBrandingPage from './pages/trustee/ConBrandingPage';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <TrackingProvider>
        <AuthProvider>
          <Routes>
            {/* Main routes */}
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
            <Route path="/documents/:documentId" element={<ProtectedRoute><DocumentViewerPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/pdf-viewer-demo" element={<ProtectedRoute><PDFViewerDemo /></ProtectedRoute>} />
            <Route path="/testing" element={<ProtectedRoute><TestingPage /></ProtectedRoute>} />
            
            {/* Trustee routes */}
            <Route path="/trustee" element={<ProtectedRoute><TrusteeIndex /></ProtectedRoute>} />
            <Route path="/trustee/dashboard" element={<ProtectedRoute><TrusteeIndex /></ProtectedRoute>} />
            <Route path="/trustee/documents" element={<ProtectedRoute><TrusteeDocumentsPage /></ProtectedRoute>} />
            <Route path="/trustee/settings" element={<ProtectedRoute><TrusteeSettingsPage /></ProtectedRoute>} />
            <Route path="/trustee/activity" element={<ProtectedRoute><TrusteeActivityPage /></ProtectedRoute>} />
            <Route path="/trustee/analytics" element={<ProtectedRoute><TrusteeAnalyticsPage /></ProtectedRoute>} />
            <Route path="/trustee/profile" element={<ProtectedRoute><TrusteeProfilePage /></ProtectedRoute>} />
            <Route path="/crm" element={<ProtectedRoute><TrusteeCRMPage /></ProtectedRoute>} />
            <Route path="/trustee/crm" element={<ProtectedRoute><TrusteeCRMPage /></ProtectedRoute>} />
            <Route path="/document/:documentId" element={<ProtectedRoute><TrusteeDocumentViewerPage /></ProtectedRoute>} />
            <Route path="/trustee/document/:documentId" element={<ProtectedRoute><TrusteeDocumentViewerPage /></ProtectedRoute>} />
            <Route path="/client/:clientId" element={<ProtectedRoute><TrusteeClientViewerPage /></ProtectedRoute>} />
            <Route path="/trustee/client/:clientId" element={<ProtectedRoute><TrusteeClientViewerPage /></ProtectedRoute>} />
            <Route path="/trustee/notifications" element={<ProtectedRoute><TrusteeNotificationsPage /></ProtectedRoute>} />
            <Route path="/trustee/calendar" element={<ProtectedRoute><TrusteeCalendarPage /></ProtectedRoute>} />
            <Route path="/trustee/converter" element={<ProtectedRoute><TrusteeConverterPage /></ProtectedRoute>} />
            <Route path="/trustee/efiling" element={<ProtectedRoute><TrusteeEFilingPage /></ProtectedRoute>} />
            <Route path="/trustee/support" element={<ProtectedRoute><TrusteeSupport /></ProtectedRoute>} />
            <Route path="/trustee/branding" element={<ProtectedRoute><TrusteeConBrandingPage /></ProtectedRoute>} />
            
            {/* Public routes */}
            <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          </Routes>
        </AuthProvider>
      </TrackingProvider>
    </QueryClientProvider>
  );
}

export default App;
