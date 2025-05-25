
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DocumentViewer } from "@/components/DocumentViewer";
import { HomePage } from "@/components/dashboard/HomePage";
import { showPerformanceToast } from "@/utils/performance";
import { Home } from "lucide-react";
import { useAuthState } from "@/hooks/useAuthState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";
import { isDebugMode, debugTiming } from "@/utils/debugMode";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";

const TrusteeIndex = () => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [documentKey, setDocumentKey] = useState<number>(0);
  const [documentTitle, setDocumentTitle] = useState<string | null>(null);
  const [isForm47, setIsForm47] = useState<boolean>(false);
  const [loadFailed, setLoadFailed] = useState<boolean>(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  const { user, session, loading: isLoading, initialized } = useAuthState();

  // Handle document selection from state
  useEffect(() => {
    if (location.state?.selectedDocument) {
      console.log("Setting selected document from location state:", location.state.selectedDocument);
      
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
      }
      
      if (location.state.documentTitle) {
        setDocumentTitle(location.state.documentTitle);
      }
      
      setDocumentKey(prev => prev + 1);
      setSelectedDocument(docId);
      
      if (isDebugMode()) {
        debugTiming('document-state-load', performance.now() - loadStart);
      } else {
        navigate('/trustee/dashboard', { replace: true });
      }
    }
  }, [location, navigate]);

  useEffect(() => {
    showPerformanceToast("Trustee Dashboard");
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

  // Show loading spinner while auth state is being determined
  if (isLoading || !initialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner />
        <p className="ml-2 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Show document viewer or main dashboard
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
              {(!isMobile || isTablet) && "Back to Dashboard"}
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
            {session ? (
              <div className="container mx-auto p-6 bg-background min-h-screen">
                <HomePage />
              </div>
            ) : (
              <div className="flex h-screen w-full items-center justify-center">
                <LoadingSpinner />
                <p className="ml-2 text-muted-foreground">
                  Redirecting to login...
                </p>
                {(() => {
                  setTimeout(() => {
                    navigate('/login', { replace: true });
                  }, 500);
                  return null;
                })()}
              </div>
            )}
          </MainLayout>
          <Footer compact className="mt-auto w-full" />
        </div>
      )}
    </div>
  );
};

export default TrusteeIndex;
