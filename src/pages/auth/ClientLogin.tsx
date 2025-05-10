
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ClientPortalForm } from '@/components/auth/ClientPortalForm';
import { ConfirmationSentScreen } from '@/components/auth/ConfirmationSentScreen';
import { useAuthState } from '@/hooks/useAuthState';
import { useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from 'lucide-react';

const ClientLogin = () => {
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const navigate = useNavigate();
  const { user, loading } = useAuthState();

  // Redirect if user is already authenticated as a client
  useEffect(() => {
    if (!loading && user) {
      const userType = user.user_metadata?.user_type;
      if (userType === 'client') {
        console.log('User already authenticated as client, redirecting to client portal');
        navigate('/client-portal', { replace: true });
      } else if (userType === 'trustee') {
        // If user is a trustee, redirect to trustee portal
        console.log('User is a trustee, redirecting to trustee portal');
        navigate('/crm', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const handleConfirmationSent = (email: string) => {
    setConfirmationEmail(email);
    setConfirmationSent(true);
  };

  const handleBackToSignIn = () => {
    setConfirmationSent(false);
  };

  const handleSwitchToTrusteePortal = () => {
    navigate('/login');
  };

  return (
    <AuthLayout isClientPortal={true}>
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
        <div className="w-full md:w-1/2 lg:w-1/3 order-2 md:order-1">
          {confirmationSent ? (
            <ConfirmationSentScreen 
              email={confirmationEmail}
              onBackToSignIn={handleBackToSignIn}
            />
          ) : (
            <div className="space-y-4">
              <Alert variant="default" className="bg-blue-50 border-blue-200">
                <InfoIcon className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700 text-sm">
                  Keep track of your case progress, access important documents, and communicate securely with your trustee.
                </AlertDescription>
              </Alert>
              <ClientPortalForm 
                onConfirmationSent={handleConfirmationSent}
                onSwitchToTrusteePortal={handleSwitchToTrusteePortal}
              />
            </div>
          )}
        </div>
        
        <div className="w-full md:w-1/2 lg:w-1/2 text-center md:text-left order-1 md:order-2">
          <div className="text-white space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Client Portal Access
            </h1>
            <p className="text-xl text-white/90">
              Access your documents securely, communicate with your trustee, and track your case progress.
            </p>
            <div className="hidden md:block">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-lg">View and download important documents</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-lg">Schedule and manage appointments</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-lg">Track your case progress in real-time</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-lg">Communicate securely with your trustee</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ClientLogin;
