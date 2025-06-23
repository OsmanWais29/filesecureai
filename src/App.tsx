
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthRoleGuard } from '@/components/auth/AuthRoleGuard';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ClientLogin from './pages/auth/ClientLogin';
import ClientPortal from './pages/client-portal/ClientPortal';
import DocumentsPage from './pages/documents/DocumentsPage';
import AdvancedFeaturesPage from './pages/AdvancedFeaturesPage';
import SettingsPage from './pages/SettingsPage';
import ProductionAudit from './pages/audit/ProductionAudit';
import AuditTrailPage from './pages/audit/AuditTrailPage';
import DocumentViewerPage from './pages/DocumentViewerPage';
import ClientViewerPage from './pages/ClientViewerPage';
import SAFAPage from './pages/SAFA/SAFAPage';
import AuditTrailAdvancedPage from './pages/AuditTrailAdvancedPage';
import { EnhancedDocumentViewer } from './components/DocumentViewer/EnhancedDocumentViewer';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background w-full">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/client-login" element={<ClientLogin />} />
              
              {/* Client Portal - Protected for clients only */}
              <Route 
                path="/client-portal/*" 
                element={
                  <AuthRoleGuard requiredRole="client" redirectPath="/client-login">
                    <ClientPortal />
                  </AuthRoleGuard>
                } 
              />
              
              {/* Trustee Portal - Protected for trustees only */}
              <Route 
                path="/" 
                element={
                  <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
                    <HomePage />
                  </AuthRoleGuard>
                } 
              />
              <Route 
                path="/documents" 
                element={
                  <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
                    <DocumentsPage />
                  </AuthRoleGuard>
                } 
              />
              <Route 
                path="/advanced-features" 
                element={
                  <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
                    <AdvancedFeaturesPage />
                  </AuthRoleGuard>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
                    <SettingsPage />
                  </AuthRoleGuard>
                } 
              />
              <Route 
                path="/audit" 
                element={
                  <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
                    <ProductionAudit />
                  </AuthRoleGuard>
                } 
              />
              <Route 
                path="/audit-trail" 
                element={
                  <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
                    <AuditTrailPage />
                  </AuthRoleGuard>
                } 
              />
              <Route 
                path="/audit-advanced" 
                element={
                  <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
                    <AuditTrailAdvancedPage />
                  </AuthRoleGuard>
                } 
              />
              <Route 
                path="/document-viewer/:documentId" 
                element={
                  <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
                    <EnhancedDocumentViewer />
                  </AuthRoleGuard>
                } 
              />
              <Route 
                path="/client-viewer/:clientId" 
                element={
                  <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
                    <ClientViewerPage />
                  </AuthRoleGuard>
                } 
              />
              <Route 
                path="/safa" 
                element={
                  <AuthRoleGuard requiredRole="trustee" redirectPath="/login">
                    <SAFAPage />
                  </AuthRoleGuard>
                } 
              />
              
              {/* Fallback routes */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
