
import { Routes, Route } from "react-router-dom";
import CRMPage from "./pages/CRMPage";
import DocumentsPage from "./pages/documents/DocumentsPage";
import NotFound from "./pages/NotFound";
import CalendarFullscreenPage from "./pages/CalendarFullscreenPage";
import ActivityPage from "./pages/ActivityPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import EFilingPage from "./pages/EFilingPage";
import ProfilePage from "./pages/ProfilePage";
import Support from "./pages/Support";
import Index from "./pages/Index";
import ClientPortal from "./pages/ClientPortal";
import DocumentViewerPage from "./pages/DocumentViewerPage";
import ClientViewerPage from "./pages/ClientViewerPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ConBrandingPage from "./pages/ConBrandingPage";
import StorageDiagnosticsPage from "./pages/StorageDiagnosticsPage";
import NotesStandalonePage from "./pages/meetings/NotesStandalonePage";
import AgendaStandalonePage from "./pages/meetings/AgendaStandalonePage";
import FeedbackStandalonePage from "./pages/meetings/FeedbackStandalonePage";
import ConverterPage from "./pages/ConverterPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Index />} /> {/* Ensure /login also maps to Index which handles auth */}
      <Route path="/client-portal" element={<ClientPortal />} /> {/* New dedicated client portal route */}
      <Route path="/crm" element={<CRMPage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/document-viewer/:documentId" element={<DocumentViewerPage />} />
      <Route path="/client-viewer/:clientId" element={<ClientViewerPage />} />
      <Route path="/meetings/notes" element={<NotesStandalonePage />} />
      <Route path="/meetings/agenda" element={<AgendaStandalonePage />} />
      <Route path="/meetings/feedback" element={<FeedbackStandalonePage />} />
      <Route path="/calendar-fullscreen" element={<CalendarFullscreenPage />} />
      <Route path="/activity" element={<ActivityPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/converter" element={<ConverterPage />} /> {/* Add the new converter route */}
      <Route path="/e-filing" element={<EFilingPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/support" element={<Support />} />
      <Route path="/SAFA" element={<ConBrandingPage />} />
      <Route path="/storage-diagnostics" element={<StorageDiagnosticsPage />} />
      <Route path="/pdf-viewer-demo" element={<PDFViewerDemo />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
