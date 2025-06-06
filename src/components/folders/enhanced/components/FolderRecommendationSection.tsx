
import { FolderRecommendation } from "../hooks/types/folderTypes";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X, LightbulbIcon } from "lucide-react";

interface FolderRecommendationSectionProps {
  showRecommendation: boolean;
  recommendation: FolderRecommendation | null;
  onAcceptRecommendation: () => Promise<void>;
  onDismissRecommendation: () => void;
}

export const FolderRecommendationSection = ({
  showRecommendation,
  recommendation,
  onAcceptRecommendation,
  onDismissRecommendation
}: FolderRecommendationSectionProps) => {
  if (!showRecommendation || !recommendation) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-secondary/10 to-primary/5 border border-secondary/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-5 backdrop-blur-sm shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="mt-1 bg-secondary/20 p-2 rounded-full self-start">
          <LightbulbIcon className="h-5 w-5 text-secondary" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-base mb-1">AI Recommendation</h3>
          <p className="text-sm mb-3 text-muted-foreground">
            The document <span className="font-medium text-foreground">{recommendation.documentTitle}</span> might 
            belong in folder:
          </p>
          
          <div className="bg-background/50 border border-border/50 rounded-md p-2 mb-3 sm:mb-4 break-words">
            <div className="font-medium text-primary flex items-center gap-1.5 flex-wrap">
              <ArrowRight className="h-4 w-4 flex-shrink-0" />
              <span className="break-all">{recommendation.folderPath.join(' > ')}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
            <Button
              size="sm"
              className="gap-1.5"
              onClick={onAcceptRecommendation}
            >
              <Check className="h-4 w-4" />
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={onDismissRecommendation}
            >
              <X className="h-4 w-4" />
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
