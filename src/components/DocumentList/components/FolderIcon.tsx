
import { useState } from "react";
import { FolderIcon as FolderIconLucide, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the allowed folder variants
export type FolderVariant = 'client' | 'archive' | 'form' | 'default' | 'uncategorized';

interface FolderIconProps {
  variant?: FolderVariant;
  isActive?: boolean;
}

export const FolderIcon = ({ variant = 'default', isActive = false }: FolderIconProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getGradient = () => {
    switch (variant) {
      case 'client':
        return 'from-blue-500 to-blue-600';
      case 'form':
        return 'from-green-500 to-green-600';
      case 'archive':
        return 'from-gray-500 to-gray-600';
      case 'uncategorized':
        return 'from-amber-500 to-amber-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid="folder-icon"
    >
      <div className={cn(
        "w-12 h-10 rounded-md bg-gradient-to-br flex items-center justify-center",
        getGradient(),
        isActive && "ring-2 ring-primary"
      )}>
        <FolderIconLucide className="h-5 w-5 text-white" />
      </div>
      
      {isHovered && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-20 rounded-md flex items-center justify-center"
          data-testid="hover-indicator"
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </div>
      )}
    </div>
  );
};
