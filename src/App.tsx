
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import HomePage from './pages/HomePage';
import DocumentsPage from './pages/documents/DocumentsPage';
import DocumentViewerPage from './pages/DocumentViewerPage';
import { ActivityPage } from './pages/ActivityPage';
import UploadTestPage from "./pages/UploadTestPage";

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
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
