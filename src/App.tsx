
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
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
import DocumentsPage from './pages/documents/DocumentsPage';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<AuthCheck><HomePage /></AuthCheck>} />
        <Route path="/documents" element={<AuthCheck><DocumentsPage /></AuthCheck>} />
        <Route path="/tasks" element={<AuthCheck><TaskManagementPage /></AuthCheck>} />
        <Route path="/document-viewer/:documentId" element={<AuthCheck><DocumentViewerPage /></AuthCheck>} />
        <Route path="/clients" element={<AuthCheck><ClientPage /></AuthCheck>} />
        <Route path="/workflows" element={<AuthCheck><WorkflowPage /></AuthCheck>} />
        <Route path="/settings" element={<AuthCheck><SettingsPage /></AuthCheck>} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
