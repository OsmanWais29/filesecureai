
import { useState, useEffect } from 'react';
import { useAuthState } from './useAuthState';

interface UserRole {
  role: string | null;
  loading: boolean;
  isAdmin: boolean;
  isTrustee: boolean;
  isClient: boolean;
}

export const useUserRole = (): UserRole => {
  const { user, loading: authLoading } = useAuthState();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (user?.user_metadata?.user_type) {
        setRole(user.user_metadata.user_type);
      } else {
        // Default fallback based on email or other criteria
        setRole('trustee');
      }
      setLoading(false);
    }
  }, [user, authLoading]);

  const isAdmin = role === 'admin';
  const isTrustee = role === 'trustee' || role === 'admin';
  const isClient = role === 'client';

  return {
    role,
    loading: loading || authLoading,
    isAdmin,
    isTrustee,
    isClient
  };
};
