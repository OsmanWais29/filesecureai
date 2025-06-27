
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
import NotificationsPage from './pages/NotificationsPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import CRMPage from './pages/CRMPage';
import ClientViewerPage from './pages/ClientViewerPage';
import SupportPage from './pages/SupportPage';
import Support from './pages/Support';

// Trustee Portal Pages
import TrusteeDashboardPage from './pages/trustee/DashboardPage';
import TrusteeCRMPage from './pages/trustee/CRMPage';
import TrusteeAnalyticsPage from './pages/trustee/AnalyticsPage';
import TrusteeClientViewerPage from './pages/trustee/ClientViewerPage';
import TrusteeNotificationsPage from './pages/trustee/NotificationsPage';
import TrusteeReportsPage from './pages/trustee/ReportsPage';
import TrusteeCalendarPage from './pages/trustee/CalendarPage';

// Client Portal Pages
import ClientPortal from './pages/ClientPortal';

// Authentication Pages
import TrusteeLogin from './pages/auth/TrusteeLogin';
import ClientLogin from './pages/auth/ClientLogin';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<TrusteeLogin />} />
        <Route path="/trustee-login" element={<TrusteeLogin />} />
        <Route path="/client-login" element={<ClientLogin />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Document Routes - Added missing route */}
        <Route path="/document/:documentId" element={<AuthCheck><DocumentViewerPage /></AuthCheck>} />
        <Route path="/document-viewer/:documentId" element={<AuthCheck><DocumentViewerPage /></AuthCheck>} />
        
        {/* Trustee Portal Routes */}
        <Route path="/trustee" element={<AuthCheck><HomePage /></AuthCheck>} />
        <Route path="/trustee/dashboard" element={<AuthCheck><TrusteeDashboardPage /></AuthCheck>} />
        <Route path="/trustee/documents" element={<AuthCheck><DocumentsPage /></AuthCheck>} />
        <Route path="/trustee/crm" element={<AuthCheck><TrusteeCRMPage /></AuthCheck>} />
        <Route path="/trustee/analytics" element={<AuthCheck><TrusteeAnalyticsPage /></AuthCheck>} />
        <Route path="/trustee/client/:clientId" element={<AuthCheck><TrusteeClientViewerPage /></AuthCheck>} />
        <Route path="/trustee/notifications" element={<AuthCheck><TrusteeNotificationsPage /></AuthCheck>} />
        <Route path="/trustee/reports" element={<AuthCheck><TrusteeReportsPage /></AuthCheck>} />
        <Route path="/trustee/calendar" element={<AuthCheck><TrusteeCalendarPage /></AuthCheck>} />
        <Route path="/trustee/income-expense" element={<AuthCheck><IncomeExpensePage /></AuthCheck>} />
        <Route path="/trustee/audit" element={<AuthCheck><AuditTrailPage /></AuthCheck>} />
        <Route path="/trustee/audit/production" element={<AuthCheck><ProductionAudit /></AuthCheck>} />
        <Route path="/trustee/converter" element={<AuthCheck><ConverterPage /></AuthCheck>} />
        <Route path="/trustee/safa" element={<AuthCheck><SAFAPage /></AuthCheck>} />
        <Route path="/trustee/tasks" element={<AuthCheck><TaskManagementPage /></AuthCheck>} />
        <Route path="/trustee/workflows" element={<AuthCheck><WorkflowPage /></AuthCheck>} />
        <Route path="/trustee/settings" element={<AuthCheck><SettingsPage /></AuthCheck>} />
        <Route path="/trustee/profile" element={<AuthCheck><ProfilePage /></AuthCheck>} />
        <Route path="/trustee/messages" element={<AuthCheck><MessagesPage /></AuthCheck>} />

        {/* Client Portal Routes */}
        <Route path="/client-portal/*" element={<AuthCheck><ClientPortal /></AuthCheck>} />
        
        {/* Legacy Routes (redirect to appropriate portal) */}
        <Route path="/" element={<AuthCheck><HomePage /></AuthCheck>} />
        <Route path="/crm" element={<AuthCheck><CRMPage /></AuthCheck>} />
        <Route path="/documents" element={<AuthCheck><DocumentsPage /></AuthCheck>} />
        <Route path="/converter" element={<AuthCheck><ConverterPage /></AuthCheck>} />
        <Route path="/income-expense" element={<AuthCheck><IncomeExpensePage /></AuthCheck>} />
        <Route path="/audit" element={<AuthCheck><AuditTrailPage /></AuthCheck>} />
        <Route path="/audit/production" element={<AuthCheck><ProductionAudit /></AuthCheck>} />
        <Route path="/analytics" element={<AuthCheck><AnalyticsPage /></AuthCheck>} />
        <Route path="/notifications" element={<AuthCheck><NotificationsPage /></AuthCheck>} />
        <Route path="/messages" element={<AuthCheck><MessagesPage /></AuthCheck>} />
        <Route path="/messages/support" element={<AuthCheck><SupportPage /></AuthCheck>} />
        <Route path="/support" element={<AuthCheck><Support /></AuthCheck>} />
        <Route path="/settings" element={<AuthCheck><SettingsPage /></AuthCheck>} />
        <Route path="/profile" element={<AuthCheck><ProfilePage /></AuthCheck>} />
        <Route path="/client-viewer/:clientId" element={<AuthCheck><ClientViewerPage /></AuthCheck>} />
        <Route path="/safa" element={<AuthCheck><SAFAPage /></AuthCheck>} />
        <Route path="/tasks" element={<AuthCheck><TaskManagementPage /></AuthCheck>} />
        <Route path="/clients" element={<AuthCheck><ClientPage /></AuthCheck>} />
        <Route path="/workflows" element={<AuthCheck><WorkflowPage /></AuthCheck>} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
