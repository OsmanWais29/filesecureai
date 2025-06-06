import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DocumentViewer } from "@/components/DocumentViewer";
import { RecentlyAccessedPage } from "@/pages/RecentlyAccessedPage";
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
  const [documentKey, setDocumentKey] = useState<number>(0);
  const [documentTitle, setDocumentTitle] = useState<string | null>(null);
  const [isForm47, setIsForm47] = useState<boolean>(false);
  const [loadFailed, setLoadFailed] = useState<boolean>(false);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState<boolean>(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  const { user, session, loading: isLoading, initialized, signOut: handleSignOut } = useAuthState();
  const [authError, setAuthError] = useState<Error | null>(null);
  const [isEmailConfirmationPending, setIsEmailConfirmationPending] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  // Debug logging for authentication state
  useEffect(() => {
    if (!isLoading && initialized) {
      if (user) {
        console.log("Index: User is authenticated", {
          id: user.id,
          email: user.email,
          userType: user.user_metadata?.user_type
        });
      } else {
        console.log("Index: User is not authenticated");
      }
    }
  }, [user, isLoading, initialized]);

  // Detect subdomain for routing
  useEffect(() => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost';
    
    if (isLocalhost) {
      const urlParams = new URLSearchParams(window.location.search);
      const detectedSubdomain = urlParams.get('subdomain');
      setSubdomain(detectedSubdomain);
      console.log("Index: Detected subdomain from URL params:", detectedSubdomain);
    } else {
      const hostParts = hostname.split('.');
      if (hostParts.length > 2) {
        setSubdomain(hostParts[0]);
        console.log("Index: Detected subdomain from hostname:", hostParts[0]);
      }
    }
  }, []);

  // Redirect users based on role or to appropriate login page
  useEffect(() => {
    if (!isLoading && initialized) {
      // If user is authenticated
      if (user) {
        const userType = user.user_metadata?.user_type;
        console.log("Index: User authenticated, type:", userType, "on subdomain:", subdomain);
        
        // User is authenticated as client
        if (userType === 'client') {
          // If on client subdomain, go to portal
          if (subdomain === 'client') {
            console.log("Index: Client on client subdomain, going to client portal");
            setRedirecting(true);
            navigate('/client-portal', { replace: true });
          } 
          // If on trustee subdomain with client account, redirect to client subdomain
          else {
            console.log("Index: Client account detected on trustee subdomain, redirecting to client subdomain");
            setRedirecting(true);
            
            const hostname = window.location.hostname;
            if (hostname === 'localhost') {
              window.location.href = window.location.origin + '?subdomain=client';
            } else {
              const hostParts = hostname.split('.');
              if (hostParts.length > 2) {
                hostParts[0] = 'client';
                window.location.href = `https://${hostParts.join('.')}`;
              } else {
                window.location.href = `https://client.${hostname}`;
              }
            }
          }
          return;
        } 
        // User is authenticated as trustee
        else if (userType === 'trustee') {
          // If on trustee subdomain, go to dashboard
          if (subdomain !== 'client') {
            console.log("Index: Trustee on trustee subdomain, redirecting to CRM dashboard");
            setRedirecting(true);
            navigate('/crm', { replace: true });
          }
          // If on client subdomain with trustee account, redirect to trustee subdomain
          else {
            console.log("Index: Trustee account detected on client subdomain, redirecting to trustee subdomain");
            setRedirecting(true);
            
            const hostname = window.location.hostname;
            if (hostname === 'localhost') {
              window.location.href = window.location.origin + '?subdomain=trustee';
            } else {
              const hostParts = hostname.split('.');
              if (hostParts.length > 2) {
                hostParts[0] = 'trustee';
                window.location.href = `https://${hostParts.join('.')}`;
              } else {
                window.location.href = `https://trustee.${hostname}`;
              }
            }
          }
          return;
        } else {
          console.log("Index: User type not set, redirecting to login for proper setup:", userType);
          setRedirecting(true);
          navigate('/login', { replace: true });
          return;
        }
      } 
      // User is not authenticated
      else {
        // Redirect to the appropriate login page based on subdomain
        console.log("Index: User not authenticated, redirecting to login");
        setRedirecting(true);
        navigate('/login', { replace: true });
        return;
      }
    }
  }, [user, isLoading, navigate, subdomain, initialized]);

  // Handle document selection from state
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

  // Show loading spinner while auth state is being determined or redirecting
  if (isLoading || redirecting) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner />
        <p className="ml-2 text-muted-foreground">
          {redirecting ? 'Redirecting...' : 'Loading...'}
        </p>
      </div>
    );
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

  // Show document viewer or redirect
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
            {session ? (
              <RecentlyAccessedPage />
            ) : (
              <div className="flex h-screen w-full items-center justify-center">
                <LoadingSpinner />
                <p className="ml-2 text-muted-foreground">
                  Redirecting to login...
                </p>
                {(() => {
                  // Dynamic redirect based on subdomain
                  console.log("Index: Redirecting to login due to missing session");
                  setTimeout(() => {
                    if (subdomain === 'client') {
                      navigate('/login', { replace: true });
                    } else {
                      navigate('/login', { replace: true });
                    }
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

export default Index;
