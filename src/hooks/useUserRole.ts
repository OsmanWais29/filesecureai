
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthState } from './useAuthState';

export type UserRole = 'client' | 'trustee' | 'admin';

export const useUserRole = () => {
  const { user } = useAuthState();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        } else {
          setRole(data.role as UserRole);
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { role, loading, isClient: role === 'client', isTrustee: role === 'trustee', isAdmin: role === 'admin' };
};
