
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Lazy load pages for better performance
import { lazy } from "react";

const Index = lazy(() => import("./pages/Index"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ClientLogin = lazy(() => import("./pages/auth/ClientLogin"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
// Create a simple wrapper for missing pages
const SAFA = lazy(() => Promise.resolve({ default: () => <div>SAFA Page</div> }));
const CRM = lazy(() => import("./pages/trustee/CRMPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const DocumentsPage = lazy(() => import("./pages/DocumentsPage"));
// Create simple wrappers for missing pages
const DocumentViewer = lazy(() => Promise.resolve({ default: () => <div>Document Viewer</div> }));
const IncomeExpensePage = lazy(() => Promise.resolve({ default: () => <div>Income Expense Page</div> }));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage").then(module => ({ default: module.AnalyticsPage })));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AuditPage = lazy(() => Promise.resolve({ default: () => <div>Audit Page</div> }));
const ConverterPage = lazy(() => import("./pages/ConverterPage"));
const TrusteeSupport = lazy(() => import("./pages/trustee/Support"));

// Initialize React Query with production optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="large" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/client-login" element={<ClientLogin />} />
                    <Route path="/client-portal/*" element={<ClientPortal />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/documents" element={<DocumentsPage />} />
                    <Route path="/document/:id" element={<DocumentViewer />} />
                    <Route path="/safa" element={<SAFA />} />
                    <Route path="/trustee/crm" element={<CRM />} />
                    <Route path="/income-expense" element={<IncomeExpensePage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/audit" element={<AuditPage />} />
                    <Route path="/converter" element={<ConverterPage />} />
                    <Route path="/trustee/support" element={<TrusteeSupport />} />
                  </Routes>
                </Suspense>
                <Toaster />
                <Sonner />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
