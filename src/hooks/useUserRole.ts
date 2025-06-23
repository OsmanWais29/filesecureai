
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthState } from './useAuthState';

export type UserRole = 'client' | 'trustee' | 'admin';

export const useUserRole = () => {
  const { user } = useAuthState();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // First check user metadata for role
        const metadataRole = user.user_metadata?.user_type;
        if (metadataRole && ['client', 'trustee', 'admin'].includes(metadataRole)) {
          setRole(metadataRole as UserRole);
          setLoading(false);
          return;
        }

        // Fallback to database role lookup
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          // Default to client role if no role found
          setRole('client');
          setError(error.message);
        } else {
          setRole(data.role as UserRole);
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setRole('client'); // Default fallback
        setError('Failed to fetch user role');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { 
    role, 
    loading, 
    error,
    isClient: role === 'client', 
    isTrustee: role === 'trustee', 
    isAdmin: role === 'admin' 
  };
};
