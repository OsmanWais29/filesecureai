
import React, { createContext, useContext, ReactNode } from 'react';

interface SessionContextType {
  user: any | null;
}

const SessionContext = createContext<SessionContextType>({
  user: null
});

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SessionContext.Provider value={{ user: null }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => {
  return useContext(SessionContext);
};
