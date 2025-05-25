
import { useEffect } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { supabase } from '@/lib/supabase';

export const NavigationAudit = () => {
  const { user, portal } = useAuthState();

  useEffect(() => {
    const logNavigation = async () => {
      if (user) {
        try {
          await supabase
            .from('audit_logs')
            .insert({
              user_id: user.id,
              action: 'navigation',
              details: {
                portal,
                timestamp: new Date().toISOString(),
                path: window.location.pathname
              }
            });
        } catch (error) {
          console.error('Failed to log navigation:', error);
        }
      }
    };

    logNavigation();
  }, [user, portal]);

  return null;
};
