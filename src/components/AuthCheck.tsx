
import React from 'react';

interface AuthCheckProps {
  children: React.ReactNode;
}

export const AuthCheck: React.FC<AuthCheckProps> = ({ children }) => {
  // Simple auth check - you can enhance this with actual auth logic
  return <>{children}</>;
};
