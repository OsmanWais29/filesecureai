import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DocumentViewer } from "@/components/DocumentViewer";
import { RecentlyAccessedPage } from "@/pages/RecentlyAccessedPage";
import { Auth } from "@/components/Auth";
import { showPerformanceToast } from "@/utils/performance";
import { Home } from "lucide-react";
import { useAuthState } from "@/hooks/useAuthState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AuthErrorDisplay } from "@/components/auth/AuthErrorDisplay";
import { EmailConfirmationPending } from "@/components/auth/EmailConfirmationPending";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";
import { isDebugMode, debugTiming } from "@/utils/debugMode";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";

const Index = () => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [documentKey, setDocumentKey] = useState<number>(0); // Key for forcing re-render
  const [documentTitle, setDocumentTitle] = useState<string | null>(null);
  const [isForm47, setIsForm47] = useState<boolean>(false);
  const [loadFailed, setLoadFailed] = useState<boolean>(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  const { user, session, loading: isLoading, signOut: handleSignOut } = useAuthState();
  const [authError, setAuthError] = useState<Error | null>(null);
  const [isEmailConfirmationPending, setIsEmailConfirmationPending] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  // Redirect users based on role
  useEffect(() => {
    if (user && !isLoading) {
      const userType = user.user_metadata?.user_type;
      
      // Redirect client users to client portal
      if (userType === 'client') {
        toast.info("Redirecting to Client Portal");
        navigate('/client-portal', { replace: true });
      } 
      // Redirect trustee users to trustee dashboard
      else if (userType === 'trustee') {
        toast.info("Redirecting to Trustee Dashboard");
        navigate('/crm', { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (location.state?.selectedDocument) {
      console.log("Setting selected document from location state:", location.state.selectedDocument);
      console.log("Source:", location.state.source || "unknown");
      
      const loadStart = performance.now();
      setLoadFailed(false);
      
      const docId = location.state.selectedDocument;
      if (!docId || typeof docId !== 'string') {
        toast.error("Invalid document ID provided");
        console.error("Invalid document ID:", docId);
        return;
      }
      
      if (location.state.isForm47) {
        setIsForm47(true);
        console.log("Document is Form 47");
      }
      
      if (location.state.documentTitle) {
        setDocumentTitle(location.state.documentTitle);
        console.log("Document title:", location.state.documentTitle);
      }
      
      setDocumentKey(prev => prev + 1);
      setSelectedDocument(docId);
      
      if (isDebugMode()) {
        debugTiming('document-state-load', performance.now() - loadStart);
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [location, navigate]);

  useEffect(() => {
    showPerformanceToast("Home Page");
  }, []);

  const handleBackToDocuments = useCallback(() => {
    setSelectedDocument(null);
    setDocumentTitle(null);
    setIsForm47(false);
    setLoadFailed(false);
    navigate('/', { replace: true });
  }, [navigate]);

  const handleDocumentLoadFailure = useCallback(() => {
    console.log("Document load failed, showing error state");
    setLoadFailed(true);
  }, []);

  useEffect(() => {
    if (selectedDocument) {
      console.log("Selected document in Index.tsx:", selectedDocument);
      if (isDebugMode()) {
        console.log("🛠️ DEBUG: Document viewer loaded in debug mode");
      }
    }
  }, [selectedDocument]);

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Handle auth errors
  if (authError) {
    return <AuthErrorDisplay error={authError instanceof Error ? authError.message : String(authError)} />;
  }

  // Handle email confirmation pending state
  if (session && isEmailConfirmationPending) {
    return (
      <EmailConfirmationPending 
        confirmationEmail={confirmationEmail} 
        onSignOut={handleSignOut} 
      />
    );
  }

  // If not authenticated, show auth component
  if (!session) {
    return <Auth />;
  }

  // Show main app content for authenticated users
  return (
    <div className={`min-h-screen bg-background flex flex-col ${selectedDocument ? '' : 'h-screen'}`}>
      {selectedDocument ? (
        <div className="h-screen flex flex-col">
          <div className="mb-1 px-1 py-2">
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "default"}
              onClick={handleBackToDocuments}
              className="flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground"
            >
              <Home className="h-3.5 w-3.5 mr-1" /> 
              {(!isMobile || isTablet) && "Back to Documents"}
              {isMobile && !isTablet && "Back"}
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <DocumentViewer 
              documentId={selectedDocument} 
              key={`doc-${selectedDocument}-${documentKey}`}
              bypassProcessing={isDebugMode() || isForm47}
              onLoadFailure={handleDocumentLoadFailure}
              documentTitle={documentTitle}
              isForm47={isForm47}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen">
          <MainLayout>
            <RecentlyAccessedPage />
          </MainLayout>
          <Footer compact className="mt-auto w-full" />
        </div>
      )}
    </div>
  );
};

export default Index;
