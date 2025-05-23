
import { Document } from "@/types/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Circle, AlertCircle, Check, Clock } from "lucide-react";
import { documentNeedsAttention } from "../../utils/documentUtils";

interface StatusIndicatorProps {
  document: Document;
  className?: string;
}

export const StatusIndicator = ({ document, className = "" }: StatusIndicatorProps) => {
  const status = document.metadata?.status || 'pending';
  const needsAttention = documentNeedsAttention(document);
  
  const baseClasses = `inline-flex h-4 w-4 items-center justify-center rounded-full ${className}`;
  
  if (needsAttention) {
    return <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`${baseClasses} bg-orange-500`}>
            <AlertCircle className="h-3 w-3 text-white" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Requires Attention</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>;
  }
  
  switch (status) {
    case 'approved':
      return <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`${baseClasses} bg-green-500`}>
              <Check className="h-3 w-3 text-white" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Approved / No Risks</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>;
    case 'pending':
      return <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`${baseClasses} bg-yellow-500`}>
              <Clock className="h-3 w-3 text-white" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Pending / Minor Issues</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>;
    case 'attention':
      return <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`${baseClasses} bg-orange-500`}>
              <AlertCircle className="h-3 w-3 text-white" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Requires Attention</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>;
    case 'critical':
      return <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`${baseClasses} bg-red-500`}>
              <AlertCircle className="h-3 w-3 text-white" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Critical Compliance Risks</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>;
    default:
      return <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`${baseClasses} bg-gray-300`}>
              <Circle className="h-3 w-3 text-white" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>No Status</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>;
  }
};
