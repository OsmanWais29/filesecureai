
import React from 'react';
import { useLocation } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  isClientPortal?: boolean;
}

export const AuthLayout = ({ children, isClientPortal = false }: AuthLayoutProps) => {
  const location = useLocation();
  const isClient = location.pathname === '/client-portal' || isClientPortal;
  
  const bgGradient = isClient 
    ? "from-blue-900 to-blue-800" 
    : "from-background to-secondary/30";

  return (
    <div className={`flex min-h-screen items-center justify-center bg-gradient-to-br ${bgGradient} p-4`}>
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/01eb992b-a293-4ef9-a5ff-fa81da6a95ed.png" 
            alt="SecureFiles AI" 
            className="h-10 sm:h-12 md:h-16"
          />
          {isClient && (
            <div className="bg-white text-blue-800 text-xs px-2 py-1 rounded font-semibold">
              CLIENT PORTAL
            </div>
          )}
        </div>
      </div>
      <div className="container max-w-[1200px] px-4">
        {children}
      </div>
    </div>
  );
};
