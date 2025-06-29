
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthState } from '@/hooks/useAuthState';

interface SessionContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  session: null,
  loading: true,
  refreshSession: async () => {},
  signOut: async () => {}
});

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, session, loading, signOut } = useAuthState();

  const refreshSession = async () => {
    // Session refresh is handled automatically by Supabase
    console.log('Session refresh requested');
  };

  return (
    <SessionContext.Provider value={{ 
      user, 
      session, 
      loading, 
      refreshSession, 
      signOut 
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => {
  return useContext(SessionContext);
};
