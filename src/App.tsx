
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import HomePage from './pages/HomePage';
import DocumentsPage from './pages/documents/DocumentsPage';
import DocumentViewerPage from './pages/DocumentViewerPage';
import { ActivityPage } from './pages/ActivityPage';
import UploadTestPage from "./pages/UploadTestPage";
import TrusteeIndex from './pages/trustee/Index';
import TrusteeDocumentsPage from './pages/trustee/DocumentsPage';
import TrusteeCRMPage from './pages/trustee/CRMPage';
import TrusteeAnalyticsPage from './pages/trustee/AnalyticsPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/document-viewer/:documentId" element={<DocumentViewerPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/upload-test" element={<UploadTestPage />} />
        
        {/* Trustee Routes */}
        <Route path="/trustee/dashboard" element={<TrusteeIndex />} />
        <Route path="/trustee/documents" element={<TrusteeDocumentsPage />} />
        <Route path="/trustee/crm" element={<TrusteeCRMPage />} />
        <Route path="/trustee/analytics" element={<TrusteeAnalyticsPage />} />
        <Route path="/trustee/calendar" element={<TrusteeIndex />} />
        <Route path="/trustee/support" element={<TrusteeIndex />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
