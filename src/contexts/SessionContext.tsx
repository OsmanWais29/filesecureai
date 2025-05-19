
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

type SessionContextType = {
  session: Session | null;
  user: any | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  loading: true,
  refreshSession: async () => {}
});

export const useSessionContext = () => useContext(SessionContext);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      
      setSession(data.session);
      setUser(data.session?.user || null);
    } catch (error) {
      console.error('Error in refreshSession:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, user, loading, refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
};
