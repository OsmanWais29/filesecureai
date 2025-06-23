
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import { QueryProvider } from './providers/QueryProvider';
import TaskManagementPage from './pages/TaskManagementPage';
import DocumentViewerPage from './pages/DocumentViewerPage';
import ClientPage from './pages/ClientPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import { AuthCheck } from './components/AuthCheck';
import SignupPage from './pages/SignupPage';
import WorkflowPage from './pages/WorkflowPage';
import SettingsPage from './pages/SettingsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

function App() {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<AuthCheck><HomePage /></AuthCheck>} />
          <Route path="/tasks" element={<AuthCheck><TaskManagementPage /></AuthCheck>} />
          <Route path="/document-viewer/:documentId" element={<AuthCheck><DocumentViewerPage /></AuthCheck>} />
          <Route path="/clients" element={<AuthCheck><ClientPage /></AuthCheck>} />
          <Route path="/workflows" element={<AuthCheck><WorkflowPage /></AuthCheck>} />
          <Route path="/settings" element={<AuthCheck><SettingsPage /></AuthCheck>} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
        <Toaster />
      </div>
    </QueryProvider>
  );
}

export default App;
