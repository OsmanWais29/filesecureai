
import { supabase } from "@/lib/supabase";
import { toString, toRecord, toSafeSpreadArray } from "@/utils/typeSafetyUtils";
import { AnalysisProcessContext } from "../../analysisProcess/types";
import { updateAnalysisStatus } from "../documentStatusUpdates";

export interface Risk {
  type: string;
  description: string;
  severity: "high" | "medium" | "low";
  regulation?: string;
  impact?: string;
  requiredAction?: string;
  solution?: string;
  deadline?: string;
}

/**
 * Perform risk assessment on the document
 * @param context The analysis process context
 * @param documentId The document ID
 * @param documentText The extracted document text
 */
export const useRiskAssessment = async (
  context: AnalysisProcessContext,
  documentId: string,
  documentText: string
): Promise<Risk[]> => {
  try {
    const { setProgress, setAnalysisStep, setProcessingStage, toast, isForm47, isForm76, isForm31 } = context;
    setAnalysisStep("Performing risk assessment...");
    setProcessingStage("risk_assessment");
    setProgress(70);
    
    // This is a placeholder. In a real implementation, this would call an
    // AI service to perform risk analysis based on the document content
    await updateAnalysisStatus(
      { id: documentId } as any,
      "risk_assessment",
      "in_progress"
    );
    
    // Default/mock risks for demonstration
    const risks: Risk[] = [];
    
    // Add form-specific risks
    if (isForm47) {
      // Consumer Proposal risks
      risks.push({
        type: "Missing Signature",
        description: "The consumer proposal must be signed by all parties involved.",
        severity: "high",
        regulation: "BIA Section 66.13",
        impact: "Proposal may be rejected",
        solution: "Ensure all required signatures are present"
      });
      
      risks.push({
        type: "Payment Terms",
        description: "Verify that payment terms are clearly specified",
        severity: "medium",
        solution: "Add explicit payment terms including amount and frequency"
      });
    } else if (isForm31) {
      // Proof of Claim risks
      risks.push({
        type: "Supporting Documentation",
        description: "Documentation supporting the claim must be attached",
        severity: "high",
        regulation: "BIA Section 124",
        solution: "Attach all relevant supporting documents"
      });
      
      risks.push({
        type: "Claim Amount Verification",
        description: "Claim amount should be verified against attached documents",
        severity: "medium",
        solution: "Reconcile claim amount with supporting documentation"
      });
    } else if (isForm76) {
      // Statement of Affairs risks
      risks.push({
        type: "Asset Disclosure",
        description: "Ensure all assets are properly disclosed",
        severity: "high",
        regulation: "BIA Section 158(d)",
        solution: "Review and confirm all assets have been properly listed"
      });
      
      risks.push({
        type: "Creditor Information",
        description: "Complete creditor information must be provided",
        severity: "medium",
        solution: "Verify all creditor information is complete and accurate"
      });
    } else {
      // Generic document risks
      risks.push({
        type: "Information Completeness",
        description: "Ensure all required fields are completed",
        severity: "medium",
        solution: "Review the document for completeness"
      });
    }
    
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Update the analysis status to completed
    await updateAnalysisStatus(
      { id: documentId } as any,
      "risk_assessment",
      "completed"
    );
    
    setProgress(80);
    return risks;
  } catch (error: any) {
    console.error("Error in risk assessment stage:", error);
    context.toast({
      title: "Risk assessment failed",
      description: error.message || "Failed to perform risk assessment",
      variant: "destructive",
    });
    
    throw error;
  }
};
