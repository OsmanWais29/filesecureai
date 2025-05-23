
import { useState, useEffect } from "react";
import { Document } from "@/types/client";
import { FolderStructure } from "@/types/folders";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  isDocumentForm47, 
  isDocumentForm76, 
  isFinancialDocument,
  extractClientName,
  findAppropriateSubfolder,
  generateFolderRecommendations
} from "../utils/folderIdentificationUtils";

interface FolderRecommendationHookResult {
  showRecommendation: boolean;
  setShowRecommendation: (show: boolean) => void;
  recommendation: any;
  setRecommendation: (rec: any) => void;
  generateRecommendations: (document: Document, folders: FolderStructure[]) => any;
  acceptRecommendation: () => void;
  rejectRecommendation: () => void;
}

export const useFolderRecommendations = (
  documents: Document[],
  folders: FolderStructure[]
): FolderRecommendationHookResult => {
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const generateRecommendations = (document: Document, availableFolders: FolderStructure[]) => {
    const isForm47 = isDocumentForm47(document);
    const isForm76 = isDocumentForm76(document);
    const isFinancial = isFinancialDocument(document);
    
    return generateFolderRecommendations(document, availableFolders);
  };

  const acceptRecommendation = async () => {
    if (!recommendation) return;
    
    try {
      // Move document to recommended folder
      const { error } = await supabase
        .from('documents')
        .update({ parent_folder_id: recommendation.suggestedFolderId })
        .eq('id', recommendation.documentId);

      if (error) throw error;

      toast.success("Document moved to recommended folder");
      setShowRecommendation(false);
      setRecommendation(null);
    } catch (error) {
      console.error('Error accepting recommendation:', error);
      toast.error("Failed to move document");
    }
  };

  const rejectRecommendation = () => {
    setShowRecommendation(false);
    setRecommendation(null);
  };

  return {
    showRecommendation,
    setShowRecommendation,
    recommendation,
    setRecommendation,
    generateRecommendations,
    acceptRecommendation,
    rejectRecommendation
  };
};
