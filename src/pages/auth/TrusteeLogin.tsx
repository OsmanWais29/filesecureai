
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthForm } from '@/components/auth/AuthForm';
import { ConfirmationSentScreen } from '@/components/auth/ConfirmationSentScreen';
import { useAuthState } from '@/hooks/useAuthState';
import { useState } from 'react';

const TrusteeLogin = () => {
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const navigate = useNavigate();
  const { user, loading } = useAuthState();
  const [isTrusteeSubdomain, setIsTrusteeSubdomain] = useState(true); // Default to true

  // Check if we're on the trustee subdomain
  useEffect(() => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost';
    
    // For localhost testing
    if (isLocalhost) {
      const urlParams = new URLSearchParams(window.location.search);
      const subdomain = urlParams.get('subdomain');
      // If explicitly set to 'client', then we're not on trustee subdomain
      setIsTrusteeSubdomain(subdomain !== 'client');
    } else {
      // For actual domain with subdomains
      const hostParts = hostname.split('.');
      // If subdomain exists and is not 'client', assume we're on trustee subdomain
      setIsTrusteeSubdomain(hostParts.length <= 2 || hostParts[0] !== 'client');
    }
  }, []);

  // Redirect if user is already authenticated as a trustee
  useEffect(() => {
    if (!loading && user) {
      const userType = user.user_metadata?.user_type;
      
      if (userType === 'trustee' && isTrusteeSubdomain) {
        console.log('User already authenticated as trustee, redirecting to CRM');
        navigate('/crm', { replace: true });
      } else if (userType === 'client' && isTrusteeSubdomain) {
        // If user is a client on trustee subdomain, redirect them
        console.log('Client account detected on trustee subdomain');
        navigate('/', { replace: true });
      }
    }
  }, [user, loading, navigate, isTrusteeSubdomain]);

  const handleConfirmationSent = (email: string) => {
    setConfirmationEmail(email);
    setConfirmationSent(true);
  };

  const handleBackToSignIn = () => {
    setConfirmationSent(false);
  };

  const handleSwitchToClientPortal = () => {
    // Redirect to client subdomain
    const hostname = window.location.hostname;
    if (hostname === 'localhost') {
      // For localhost testing
      window.location.href = window.location.origin + '?subdomain=client';
    } else {
      // For actual domain
      const hostParts = hostname.split('.');
      if (hostParts.length > 2) {
        hostParts[0] = 'client';
        window.location.href = `https://${hostParts.join('.')}`;
      } else {
        window.location.href = `https://client.${hostname}`;
      }
    }
  };

  return (
    <AuthLayout isClientPortal={false}>
      {confirmationSent ? (
        <ConfirmationSentScreen 
          email={confirmationEmail}
          onBackToSignIn={handleBackToSignIn}
        />
      ) : (
        <AuthForm 
          onConfirmationSent={handleConfirmationSent} 
          onSwitchToClientPortal={handleSwitchToClientPortal}
        />
      )}
    </AuthLayout>
  );
};

export default TrusteeLogin;
