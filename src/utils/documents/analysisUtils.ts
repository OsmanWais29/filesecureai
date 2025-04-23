
import { AnalysisResult } from './types/analysisTypes';
import { 
  getMockForm65Data, 
  getMockForm66Data, 
  getMockForm76Data,
  getMockForm31Data 
} from './mockData/formMockData';
export { 
  triggerDocumentAnalysis,
  saveAnalysisResults,
  updateDocumentStatus,
  createClientIfNotExists
} from './api/analysisApi';

export type { AnalysisResult };

export const performMockAnalysis = (formNumber = '76', formType = 'bankruptcy'): AnalysisResult => {
  // Get form number from the title or default to 76
  const formNum = formNumber || '76';
  const formTypeLower = formType?.toLowerCase() || '';
  
  // Choose the right mock data based on form number
  if (formNum === '31' || formTypeLower.includes('proof of claim')) {
    return getMockForm31Data();
  } else if (formNum === '66' || formTypeLower.includes('consumer proposal')) {
    return getMockForm66Data();
  } else if (formNum === '65' || formTypeLower.includes('notice of intention')) {
    return getMockForm65Data();
  } else {
    // Default to Form 76 for bankruptcy
    return getMockForm76Data();
  }
};

// Add functions to create mock data for Form 31
export const createForm31RiskAssessment = async (documentId: string): Promise<void> => {
  try {
    const { supabase } = await import('@/lib/supabase');
    
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    
    // Prepare Form 31-specific detailed risks
    const form31Risks = [
      {
        type: "compliance",
        description: "Missing Creditor Details",
        severity: "high",
        regulation: "BIA Rule 114(1)",
        impact: "May delay claim processing",
        requiredAction: "Complete all creditor information fields",
        solution: "Add complete creditor contact information",
        deadline: "Immediately"
      },
      {
        type: "compliance",
        description: "No Claim Amount Specified",
        severity: "high",
        regulation: "BIA Section 124(1)",
        impact: "Claim cannot be validated without amount",
        requiredAction: "Specify total claim amount",
        solution: "Add claim amount in dollars and cents",
        deadline: "Immediately"
      },
      {
        type: "legal",
        description: "Missing Supporting Documentation",
        severity: "medium",
        regulation: "BIA Section 124(2)",
        impact: "Claim may be disallowed without evidence",
        requiredAction: "Attach relevant supporting documents",
        solution: "Append invoices, contracts, statements, etc.",
        deadline: "3 days"
      },
      {
        type: "compliance",
        description: "Unsigned Proof of Claim",
        severity: "high",
        regulation: "BIA Rule 124(4)",
        impact: "Claim is invalid without signature",
        requiredAction: "Ensure document is properly signed",
        solution: "Obtain creditor signature on claim form",
        deadline: "Immediately"
      },
      {
        type: "compliance",
        description: "Claim Type Not Selected",
        severity: "medium",
        regulation: "BIA Rules",
        impact: "Cannot determine claim classification",
        requiredAction: "Select appropriate claim type",
        solution: "Check applicable box for claim category",
        deadline: "2 days"
      }
    ];

    // Add detailed Form 31 client information
    const clientInfo = {
      clientName: "Acme Corporation",
      creditorName: "Acme Corporation",
      formNumber: "31",
      formType: "form-31",
      dateSigned: "March 15, 2025",
      type: "Proof of Claim",
      summary: "Proof of Claim (Form 31) filed by Acme Corporation as creditor",
      claimAmount: "$45,000.00"
    };

    // Create or update the document analysis
    const { data: existingAnalysis } = await supabase
      .from('document_analysis')
      .select('*')
      .eq('document_id', documentId)
      .maybeSingle();

    if (existingAnalysis) {
      // Update existing analysis
      await supabase
        .from('document_analysis')
        .update({
          content: {
            extracted_info: clientInfo,
            risks: form31Risks,
            regulatory_compliance: {
              status: 'requires_review',
              details: 'Form 31 Proof of Claim requires verification of claim details',
              references: [
                'BIA Rule 114(1)', 
                'BIA Section 124(1)', 
                'BIA Section 124(2)',
                'BIA Rule 124(4)'
              ]
            }
          }
        })
        .eq('id', existingAnalysis.id);
    } else {
      // Create new analysis
      await supabase
        .from('document_analysis')
        .insert({
          document_id: documentId,
          user_id: userData.user?.id,
          content: {
            extracted_info: clientInfo,
            risks: form31Risks,
            regulatory_compliance: {
              status: 'requires_review',
              details: 'Form 31 Proof of Claim requires verification of claim details',
              references: [
                'BIA Rule 114(1)', 
                'BIA Section 124(1)', 
                'BIA Section 124(2)',
                'BIA Rule 124(4)'
              ]
            }
          }
        });
    }
    
    // Update document metadata
    await supabase
      .from('documents')
      .update({
        ai_processing_status: 'complete',
        metadata: {
          formType: 'form-31',
          formNumber: '31',
          clientName: clientInfo.clientName,
          creditorName: clientInfo.creditorName,
          claimAmount: clientInfo.claimAmount,
          dateSigned: clientInfo.dateSigned,
          documentStatus: "Submitted - Under Review",
          claim_details: {
            claim_type: "Unsecured",
            supporting_docs: "Required"
          }
        }
      })
      .eq('id', documentId);
      
  } catch (error) {
    console.error('Error creating Form 31 analysis:', error);
    throw error;
  }
};

// Create a new function to detect Form 31 specifically
export const isForm31Document = (text: string, fileName: string): boolean => {
  const lowerText = text.toLowerCase();
  const lowerFileName = fileName.toLowerCase();
  
  const form31Keywords = [
    "proof of claim", 
    "form 31", 
    "creditor claim",
    "bankrupt or person",
    "type a: unsecured claim",
    "particulars of security"
  ];
  
  // Check filename first
  if (lowerFileName.includes('form 31') || 
      lowerFileName.includes('form31') || 
      lowerFileName.includes('proof of claim')) {
    return true;
  }
  
  // Then check document content
  let matchCount = 0;
  form31Keywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      matchCount++;
    }
  });
  
  return matchCount >= 2;
};
