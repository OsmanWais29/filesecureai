
import { Route, Routes } from 'react-router-dom';
import DocumentViewerPage from './pages/DocumentViewerPage';
import DocumentsPage from './pages/DocumentsPage';
import HomePage from './pages/HomePage';
import { AuthProvider } from '@/contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import PricingPage from './pages/PricingPage';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage';
import SubscriptionCancelPage from './pages/SubscriptionCancelPage';
import { useEffect } from 'react';
import { checkAndRefreshToken } from './utils/jwtMonitoring';
import DiagnosticsPage from './pages/DiagnosticsPage';
import MeetingsPage from './pages/MeetingsPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/documents/:documentId" element={<DocumentViewerPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />
      <Route path="/subscription-cancel" element={<SubscriptionCancelPage />} />
      <Route path="/diagnostics" element={<DiagnosticsPage />} />
      <Route path="/meetings/*" element={<MeetingsPage />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    // Perform initial token check and refresh
    checkAndRefreshToken();

    // Set up interval to periodically check and refresh token (e.g., every 30 minutes)
    const intervalId = setInterval(checkAndRefreshToken, 30 * 60 * 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster />
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  );
}

export default App;
