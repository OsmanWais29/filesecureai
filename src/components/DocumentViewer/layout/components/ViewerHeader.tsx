
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Menu, MessageSquare, Users, History, CheckSquare } from "lucide-react";
import { DeepSeekAnalysisButton } from "../../DeepSeekAnalysisButton";

interface ViewerHeaderProps {
  documentTitle: string;
  documentType: string;
  isForm47: boolean;
  isTablet: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  toggleCollaborationPanel: () => void;
  documentId?: string;
  hasAnalysis?: boolean;
  onAnalysisComplete?: () => void;
}

export const ViewerHeader: React.FC<ViewerHeaderProps> = ({
  documentTitle,
  documentType,
  isForm47,
  isTablet,
  isMobile,
  toggleSidebar,
  toggleCollaborationPanel,
  documentId,
  hasAnalysis = false,
  onAnalysisComplete = () => {}
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border/20 bg-white dark:bg-background">
      <div className="flex items-center gap-3">
        {(isMobile || isTablet) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="flex items-center gap-2"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <div>
            <h1 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              {documentTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isForm47 ? "Bankruptcy Form" : `Document Type: ${documentType}`}
            </p>
          </div>
        </div>
      </div>

      {/* DeepSeek AI Analysis System */}
      <div className="flex items-center gap-3">
        {documentId && (
          <DeepSeekAnalysisButton
            documentId={documentId}
            hasAnalysis={hasAnalysis}
            onAnalysisComplete={onAnalysisComplete}
            className="max-w-xs"
          />
        )}
        
        {(isMobile || isTablet) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollaborationPanel}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
