
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const LoadingSpinner = ({ size = 'medium', className = '' }: LoadingSpinnerProps) => {
  // Map size to dimensions
  const dimensions = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-10 h-10'
  }[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${dimensions} animate-spin rounded-full border-2 border-t-transparent border-blue-600`}></div>
    </div>
  );
};
