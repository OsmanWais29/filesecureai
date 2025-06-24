
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
import ConverterPage from './pages/ConverterPage';
import SAFAPage from './pages/SAFA/SAFAPage';
import IncomeExpensePage from './pages/income-expense/IncomeExpensePage';
import AuditTrailPage from './pages/audit/AuditTrailPage';
import ProductionAudit from './pages/audit/ProductionAudit';

// Trustee Portal Pages
import TrusteeDashboardPage from './pages/trustee/DashboardPage';
import TrusteeDocumentsPage from './pages/trustee/DocumentsPage';
import TrusteeCRMPage from './pages/trustee/CRMPage';
import TrusteeAnalyticsPage from './pages/trustee/AnalyticsPage';
import TrusteeClientViewerPage from './pages/trustee/ClientViewerPage';
import TrusteeNotificationsPage from './pages/trustee/NotificationsPage';
import TrusteeReportsPage from './pages/trustee/ReportsPage';
import TrusteeCalendarPage from './pages/trustee/CalendarPage';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Main Dashboard - redirect to trustee dashboard */}
        <Route path="/" element={<AuthCheck><TrusteeDashboardPage /></AuthCheck>} />
        
        {/* Trustee Portal Routes */}
        <Route path="/trustee/dashboard" element={<AuthCheck><TrusteeDashboardPage /></AuthCheck>} />
        <Route path="/trustee/documents" element={<AuthCheck><TrusteeDocumentsPage /></AuthCheck>} />
        <Route path="/trustee/crm" element={<AuthCheck><TrusteeCRMPage /></AuthCheck>} />
        <Route path="/trustee/analytics" element={<AuthCheck><TrusteeAnalyticsPage /></AuthCheck>} />
        <Route path="/trustee/client/:clientId" element={<AuthCheck><TrusteeClientViewerPage /></AuthCheck>} />
        <Route path="/trustee/notifications" element={<AuthCheck><TrusteeNotificationsPage /></AuthCheck>} />
        <Route path="/trustee/reports" element={<AuthCheck><TrusteeReportsPage /></AuthCheck>} />
        <Route path="/trustee/calendar" element={<AuthCheck><TrusteeCalendarPage /></AuthCheck>} />
        
        {/* Core Application Routes */}
        <Route path="/documents" element={<AuthCheck><DocumentsPage /></AuthCheck>} />
        <Route path="/converter" element={<AuthCheck><ConverterPage /></AuthCheck>} />
        <Route path="/safa" element={<AuthCheck><SAFAPage /></AuthCheck>} />
        <Route path="/income-expense" element={<AuthCheck><IncomeExpensePage /></AuthCheck>} />
        <Route path="/audit" element={<AuthCheck><AuditTrailPage /></AuthCheck>} />
        <Route path="/audit/production" element={<AuthCheck><ProductionAudit /></AuthCheck>} />
        
        {/* General Routes */}
        <Route path="/tasks" element={<AuthCheck><TaskManagementPage /></AuthCheck>} />
        <Route path="/document-viewer/:documentId" element={<AuthCheck><DocumentViewerPage /></AuthCheck>} />
        <Route path="/clients" element={<AuthCheck><ClientPage /></AuthCheck>} />
        <Route path="/workflows" element={<AuthCheck><WorkflowPage /></AuthCheck>} />
        <Route path="/settings" element={<AuthCheck><SettingsPage /></AuthCheck>} />
        <Route path="/analytics" element={<AuthCheck><AnalyticsPage /></AuthCheck>} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
