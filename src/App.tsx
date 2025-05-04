
import { Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import ClientPortal from "./pages/ClientPortal";

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
import Support from "./pages/Support"; // Fixed import path
import SettingsPage from "./pages/trustee/SettingsPage";
import NotificationsPage from "./pages/trustee/NotificationsPage";
import ConBrandingPage from "./pages/trustee/ConBrandingPage";
import ConverterPage from "./pages/trustee/ConverterPage";
import MeetingsPage from "./pages/MeetingsPage"; // Add MeetingsPage import

import "./App.css";

function App() {
  return (
    <Routes>
      {/* Trustee application routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Index />} />
      <Route path="/crm" element={<CRMPage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/document-viewer/:documentId" element={<DocumentViewerPage />} />
      <Route path="/client-viewer/:clientId" element={<ClientViewerPage />} />
      <Route path="/calendar-fullscreen" element={<CalendarFullscreenPage />} />
      <Route path="/activity" element={<ActivityPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/converter" element={<ConverterPage />} />
      <Route path="/e-filing" element={<EFilingPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/support" element={<Support />} />
      <Route path="/meetings" element={<MeetingsPage />} /> {/* Add MeetingsPage route */}
      <Route path="/SAFA" element={<ConBrandingPage />} />

      {/* Client portal routes - use the ClientPortal layout for all client portal routes */}
      <Route path="/client-portal/*" element={<ClientPortal />} />

      {/* 404 catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
