
import React from 'react';
import { useLocation } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  isClientPortal?: boolean;
}

export const AuthLayout = ({ children, isClientPortal = false }: AuthLayoutProps) => {
  const location = useLocation();
  const isClient = location.pathname === '/client-portal' || isClientPortal;
  
  // Updated gradient colors to better blend with the logo
  const bgGradient = isClient 
    ? "from-blue-900 via-blue-800 to-blue-700" 
    : "from-background to-secondary/30";

  return (
    <div className={`flex flex-col min-h-screen bg-gradient-to-br ${bgGradient}`}>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10" 
        style={{
          backgroundImage: isClient 
            ? "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.2\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" 
            : "none"
        }}
      ></div>
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 z-10">
        <div className="flex items-center gap-6">
          <img 
            src="/lovable-uploads/01eb992b-a293-4ef9-a5ff-fa81da6a95ed.png" 
            alt="SecureFiles AI" 
            className={`h-10 sm:h-12 md:h-16 ${isClient ? "filter brightness-0 invert" : ""}`}
          />
          {isClient && (
            <div className="bg-white text-blue-700 text-xs px-2 py-1 rounded font-bold shadow-sm ml-2">
              CLIENT PORTAL
            </div>
          )}
        </div>
      </div>
      
      <div className="container flex-grow relative z-20 max-w-[1200px] px-4 py-16">
        {children}
      </div>
      
      <div className="w-full py-4 text-center text-white/70 text-xs z-10">
        <p>&copy; {new Date().getFullYear()} SecureFiles AI. All rights reserved.</p>
      </div>
    </div>
  );
};
