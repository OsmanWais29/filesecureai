
import React, { useState } from 'react';
import { cn } from "@/lib/utils";

type FolderVariant = 'default' | 'client' | 'form' | 'financials' | 'archive';

interface FolderIconProps {
  variant?: FolderVariant;
  className?: string;
}

export const FolderIcon: React.FC<FolderIconProps> = ({ 
  variant = 'default',
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getGradientClass = () => {
    switch (variant) {
      case 'client':
        return 'from-blue-600 to-blue-400';
      case 'form':
        return 'from-green-500 to-green-300';
      case 'financials':
        return 'from-yellow-500 to-yellow-300';
      case 'archive':
        return 'from-gray-500 to-gray-300';
      default:
        return 'from-blue-500 to-blue-300';
    }
  };

  return (
    <div 
      data-testid="folder-icon"
      className={cn(
        "relative w-14 h-12 rounded-md bg-gradient-to-br", 
        getGradientClass(),
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Folder top */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-white/20 rounded-t-md" />
      
      {/* Hover effect */}
      {isHovered && (
        <div 
          data-testid="hover-indicator"
          className="absolute inset-0 bg-white/10 rounded-md animate-pulse"
        />
      )}
      
      {/* Optional: folder details */}
      <div className="absolute bottom-0 left-0 right-0 p-1 text-[8px] text-white font-medium text-center truncate">
        {variant !== 'default' ? variant.charAt(0).toUpperCase() + variant.slice(1) : 'Folder'}
      </div>
    </div>
  );
};
