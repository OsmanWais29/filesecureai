
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  isClientPortal?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, isClientPortal = false }) => {
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isClientPortal 
        ? 'bg-gradient-to-br from-blue-600 to-blue-800' 
        : 'bg-gradient-to-br from-gray-50 to-gray-100'
    }`}>
      <div className="w-full max-w-md mx-auto p-6">
        {children}
      </div>
    </div>
  );
};
