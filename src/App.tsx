
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TrackingProvider } from './providers/TrackingProvider';
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

function App() {
  return (
    <Router>
      <QueryClientProvider client={new QueryClient()}>
        <TrackingProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
              <Route path="/documents/:documentId" element={<ProtectedRoute><DocumentViewerPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
              <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
              <Route path="/pdf-viewer-demo" element={<ProtectedRoute><PDFViewerDemo /></ProtectedRoute>} />
              <Route path="/testing" element={<ProtectedRoute><TestingPage /></ProtectedRoute>} />
              <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
            </Routes>
          </AuthProvider>
        </TrackingProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
