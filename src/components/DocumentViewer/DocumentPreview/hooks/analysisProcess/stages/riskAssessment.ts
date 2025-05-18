import { supabase } from "@/lib/supabase";
import { DocumentRecord } from "../../types";
import { updateAnalysisStatus } from "../documentStatusUpdates";
import { AnalysisProcessContext } from "../types";
import { createForm47RiskAssessment } from "@/utils/documentOperations";
import { isForm31 } from "../formIdentification";

export const riskAssessment = async (
  documentRecord: DocumentRecord,
  isForm76: boolean,
  context: AnalysisProcessContext
): Promise<void> => {
  const { setAnalysisStep, setProgress, isForm47 = false, isForm31: isForm31Context = false, documentText = "" } = context;
  
  // Check if this is a Form 47 (Consumer Proposal) - use either context or metadata
  const isForm47Document = isForm47 || documentRecord.metadata?.formType === 'form-47' || 
                  documentRecord.title?.toLowerCase().includes('form 47') ||
                  documentRecord.title?.toLowerCase().includes('consumer proposal');
                  
  // Check if this is a Form 31 (Proof of Claim)
  const isForm31Document = isForm31Context || isForm31(documentRecord, documentText) ||
                  documentRecord.metadata?.formType === 'form-31' ||
                  documentRecord.metadata?.formType === 'proof-of-claim' ||
                  documentRecord.title?.toLowerCase().includes('form 31') ||
                  documentRecord.title?.toLowerCase().includes('proof of claim');
  
  if (isForm47Document) {
    setAnalysisStep("Stage 4: Analyzing Consumer Proposal for compliance...");
  } else if (isForm31Document) {
    setAnalysisStep("Stage 4: Analyzing Proof of Claim (Form 31) compliance...");
  } else if (isForm76) {
    setAnalysisStep("Stage 4: Performing regulatory compliance analysis for Form 76..."); 
  } else {
    setAnalysisStep("Stage 4: Risk & Compliance Assessment...");
  }
  
  setProgress(55);
  
  console.log(`Starting risk assessment for document ${documentRecord.id}, Form 76: ${isForm76}, Form 47: ${isForm47Document}, Form 31: ${isForm31Document}`);
  
  try {
    // For Form 76, add specific risks related to Statement of Affairs
    if (isForm76) {
      // Get existing analysis record if any
      const { data: existingAnalysis } = await supabase
        .from('document_analysis')
        .select('*')
        .eq('document_id', documentRecord.id)
        .maybeSingle();
      
      // Prepare Form 76-specific risks
      const form76Risks = [
        {
          type: "Missing Financial Information",
          description: "Form 76 requires complete financial disclosure including assets, liabilities, and income details",
          severity: "high",
          regulation: "BIA Section 158(d)",
          impact: "Incomplete disclosure may lead to rejection of filing",
          requiredAction: "Ensure all financial sections are completed",
          solution: "Review and complete all financial disclosure sections",
          deadline: "7 days"
        },
        {
          type: "Signature Verification",
          description: "Form 76 requires both debtor and trustee signatures to be valid",
          severity: "high",
          regulation: "BIA Directive 1R6",
          impact: "Without proper signatures, the form may be rejected",
          requiredAction: "Verify all required signatures are present",
          solution: "Obtain missing signatures if needed",
          deadline: "Immediately"
        },
        {
          type: "Disclosure Accuracy",
          description: "All information in Form 76 must be accurate and truthful",
          severity: "medium",
          regulation: "BIA Section 199",
          impact: "False statements can lead to rejection of discharge",
          requiredAction: "Verify accuracy of all disclosed information",
          solution: "Review and validate all provided information",
          deadline: "10 days"
        },
        {
          type: "Missing Witness Signature",
          description: "Form 76 requires witness signature for legal validation",
          severity: "medium",
          regulation: "BIA Procedure",
          impact: "May cause legal delays in processing",
          requiredAction: "Ensure a witness signs the document",
          solution: "Obtain witness signature before submission",
          deadline: "3 days"
        },
        {
          type: "Court Reference Missing",
          description: "Form 76 should include court case reference for filing",
          severity: "low",
          regulation: "BIA Best Practice",
          impact: "Difficult to track in court system",
          requiredAction: "Add court case number if available",
          solution: "Update document with court reference number",
          deadline: "Before filing"
        }
      ];
      
      // Update or create the analysis record with Form 76 risks
      if (existingAnalysis) {
        // Add Form 76 risks to existing risks
        const existingContent = existingAnalysis.content || {};
        const existingRisks = Array.isArray(existingContent.risks) ? existingContent.risks : [];
        
        const updatedContent = {
          ...(typeof existingContent === 'object' ? existingContent : {}),
          extracted_info: {
            ...(existingContent && typeof existingContent === 'object' && 
               existingContent.extracted_info && typeof existingContent.extracted_info === 'object' 
               ? existingContent.extracted_info : {}),
            formType: 'form-76',
            formNumber: '76'
          },
          risks: [...existingRisks, ...form76Risks]
        };
        
        await supabase
          .from('document_analysis')
          .update({ content: updatedContent })
          .eq('document_id', documentRecord.id);
          
        console.log('Updated existing analysis with Form 76 risks');
      } else {
        // Create new analysis record with Form 76 risks
        const { data: userData } = await supabase.auth.getUser();
        
        await supabase
          .from('document_analysis')
          .insert({
            document_id: documentRecord.id,
            user_id: userData?.user?.id,
            content: {
              extracted_info: {
                formType: 'form-76',
                formNumber: '76',
                summary: 'Statement of Affairs (Form 76) requires review'
              },
              risks: form76Risks,
              regulatory_compliance: {
                status: 'requires_review',
                details: 'Form 76 requires detailed review for regulatory compliance',
                references: ['BIA Section 158', 'BIA Section 199', 'OSB Directive 1R6']
              }
            }
          });
          
        console.log('Created new analysis with Form 76 risks');
      }
    } else if (isForm47Document) {
      // Process Form 47 Consumer Proposal
      await createForm47RiskAssessment(documentRecord.id);
      console.log('Created Form 47 risk assessment');
    } else if (isForm31Document) {
      // Process Form 31 Proof of Claim
      // Get existing analysis record if any
      const { data: existingAnalysis } = await supabase
        .from('document_analysis')
        .select('*')
        .eq('document_id', documentRecord.id)
        .maybeSingle();
      
      // Create Form 31 specific risks based on comprehensive guide
      const form31Risks = [
        {
          type: "Document Verification",
          description: "Form 31 must be the current version prescribed by the Superintendent",
          severity: "medium",
          regulation: "BIA Rule 150",
          impact: "Outdated forms may be rejected by the court or OSB",
          requiredAction: "Verify form version is current",
          solution: "Download current version from OSB website if needed",
          deadline: "Immediately"
        },
        {
          type: "Signature Authentication",
          description: "Form 31 requires proper signature authentication",
          severity: "high",
          regulation: "BIA Rule 31(1)",
          impact: "Improperly signed forms are invalid and not legally enforceable",
          requiredAction: "Verify creditor signature is present",
          solution: "Ensure document is properly signed by authorized party",
          deadline: "Immediately"
        },
        {
          type: "Supporting Documentation",
          description: "Form 31 requires appropriate supporting documents based on claim type",
          severity: "medium",
          regulation: "BIA Practice",
          impact: "Claims without proper support may be disallowed",
          requiredAction: "Review attachments and supporting documentation",
          solution: "Request additional documentation if claim support is insufficient",
          deadline: "7 days"
        },
        {
          type: "Claim Classification",
          description: "Form 31 claim type must be properly selected (Section 4 checkboxes)",
          severity: "high",
          regulation: "BIA s. 121-128",
          impact: "Incorrectly classified claims may affect distribution and voting rights",
          requiredAction: "Verify claim type selection is appropriate",
          solution: "Validate claim type against supporting documentation",
          deadline: "5 days"
        },
        {
          type: "Electronic Filing Compliance",
          description: "Electronic filing of Form 31 must include Form 1.1 declaration",
          severity: "medium",
          regulation: "OSB Directive No. 18R",
          impact: "Non-compliant e-filings may be rejected",
          requiredAction: "Verify Form 1.1 is included if electronically filed",
          solution: "Attach Form 1.1 declaration if missing",
          deadline: "3 days"
        }
      ];
      
      // Extract Form 31 specific fields from the document text
      const extractedClaimInfo: Record<string, string> = {};
      if (documentText) {
        console.log("Extracting Form 31 specific fields from text...");
        
        // Extract creditor name
        const creditorMatch = documentText.match(/creditor(?:'s)?\s+name:?\s*([^\n,]+)/i) || 
                            documentText.match(/name\s+of\s+creditor:?\s*([^\n,]+)/i);
        
        // Extract claim amount
        const amountMatch = documentText.match(/(?:total|claim)\s+amount:?\s*[$]?\s*([\d,.]+)/i) || 
                          documentText.match(/amount\s+of\s+claim:?\s*[$]?\s*([\d,.]+)/i);
        
        // Extract claim type
        const claimTypeMatch = documentText.match(/(?:claim|type)\s+([A-J])\s*[-:]\s*([^\n,]+)/i) ||
                             documentText.match(/(?:secured|unsecured|preferred)\s+claim/i);
        
        // Extract security details if available
        const securityMatch = documentText.match(/security:?\s*([^\n]+)/i) ||
                            documentText.match(/particulars\s+of\s+security:?\s*([^\n]+)/i);
        
        // Extract debtor name
        const debtorMatch = documentText.match(/(?:debtor|bankrupt)(?:'s)?\s+name:?\s*([^\n,]+)/i) ||
                          documentText.match(/in\s+(?:the|re)\s+(?:matter\s+of)\s*(?:the\s+bankruptcy\s+of)?\s*([^\n,]+)/i);
        
        // Extract filing date
        const filingMatch = documentText.match(/(?:date|filed)\s+on:?\s*([0-9]{1,2}[\s/\-\.]{1,2}[0-9]{1,2}[\s/\-\.]{1,2}[0-9]{2,4}|[a-z]+\s+[0-9]{1,2},?\s*[0-9]{2,4})/i);
        
        if (creditorMatch && creditorMatch[1]) {
          extractedClaimInfo.creditorName = creditorMatch[1].trim();
        }
        
        if (amountMatch && amountMatch[1]) {
          extractedClaimInfo.claimAmount = `$${amountMatch[1].trim()}`;
        }
        
        if (claimTypeMatch) {
          if (claimTypeMatch[2]) {
            extractedClaimInfo.claimType = claimTypeMatch[2].trim();
          } else {
            extractedClaimInfo.claimType = claimTypeMatch[0].trim();
          }
        }
        
        if (securityMatch && securityMatch[1]) {
          extractedClaimInfo.securityDetails = securityMatch[1].trim();
        }
        
        if (debtorMatch && debtorMatch[1]) {
          extractedClaimInfo.debtorName = debtorMatch[1].trim();
        }
        
        if (filingMatch && filingMatch[1]) {
          extractedClaimInfo.filingDate = filingMatch[1].trim();
        }
        
        console.log("Extracted Form 31 fields:", extractedClaimInfo);
      }
      
      // Update or create analysis with Form 31 risks and extracted info
      if (existingAnalysis) {
        const existingContent = existingAnalysis.content || {};
        const existingExtractedInfo = existingContent && typeof existingContent === 'object' && existingContent.extracted_info 
          ? existingContent.extracted_info 
          : {};
        const existingRisks = existingContent && typeof existingContent === 'object' && Array.isArray(existingContent.risks) 
          ? existingContent.risks 
          : [];
        
        const updatedContent = {
          ...(typeof existingContent === 'object' ? existingContent : {}),
          extracted_info: {
            ...(typeof existingExtractedInfo === 'object' ? existingExtractedInfo : {}),
            formType: 'form-31',
            formNumber: '31',
            type: 'proof-of-claim',
            claimantName: typeof existingExtractedInfo === 'object' && existingExtractedInfo.claimantName 
              ? String(existingExtractedInfo.claimantName) 
              : extractedClaimInfo.creditorName || '',
            creditorName: typeof existingExtractedInfo === 'object' && existingExtractedInfo.creditorName 
              ? String(existingExtractedInfo.creditorName) 
              : extractedClaimInfo.creditorName || '',
            claimAmount: typeof existingExtractedInfo === 'object' && existingExtractedInfo.claimAmount 
              ? existingExtractedInfo.claimAmount 
              : extractedClaimInfo.claimAmount || '',
            claimType: typeof existingExtractedInfo === 'object' && existingExtractedInfo.claimType 
              ? existingExtractedInfo.claimType 
              : extractedClaimInfo.claimType || '',
            securityDetails: typeof existingExtractedInfo === 'object' && existingExtractedInfo.securityDetails 
              ? existingExtractedInfo.securityDetails 
              : extractedClaimInfo.securityDetails || '',
            debtorName: typeof existingExtractedInfo === 'object' && existingExtractedInfo.debtorName 
              ? String(existingExtractedInfo.debtorName) 
              : extractedClaimInfo.debtorName || existingExtractedInfo.clientName || '',
            dateSigned: typeof existingExtractedInfo === 'object' && existingExtractedInfo.dateSigned 
              ? existingExtractedInfo.dateSigned 
              : extractedClaimInfo.filingDate || '',
            filingDate: typeof existingExtractedInfo === 'object' && existingExtractedInfo.filingDate 
              ? existingExtractedInfo.filingDate 
              : extractedClaimInfo.filingDate || '',
            summary: "Form 31 - Proof of Claim against debtor/bankrupt",
            documentStatus: typeof existingExtractedInfo === 'object' && existingExtractedInfo.documentStatus 
              ? existingExtractedInfo.documentStatus 
              : 'Pending Review'
          },
          risks: [...existingRisks, ...form31Risks]
        };
        
        await supabase
          .from('document_analysis')
          .update({ content: updatedContent })
          .eq('document_id', documentRecord.id);
          
        console.log('Updated existing analysis with Form 31 info and risks');
      } else {
        // Create new analysis with Form 31 risks
        const { data: userData } = await supabase.auth.getUser();
        
        await supabase
          .from('document_analysis')
          .insert({
            document_id: documentRecord.id,
            user_id: userData?.user?.id,
            content: {
              extracted_info: {
                formType: 'form-31',
                formNumber: '31',
                type: 'proof-of-claim',
                claimantName: extractedClaimInfo.creditorName || '',
                creditorName: extractedClaimInfo.creditorName || '',
                claimAmount: extractedClaimInfo.claimAmount || '',
                claimType: extractedClaimInfo.claimType || '',
                securityDetails: extractedClaimInfo.securityDetails || '',
                debtorName: extractedClaimInfo.debtorName || documentRecord.metadata?.clientName || '',
                dateSigned: extractedClaimInfo.filingDate || '',
                filingDate: extractedClaimInfo.filingDate || '',
                summary: "Form 31 - Proof of Claim against debtor/bankrupt",
                documentStatus: 'Pending Review'
              },
              risks: form31Risks,
              regulatory_compliance: {
                status: 'requires_review',
                details: 'Form 31 requires detailed review for regulatory compliance',
                references: ['BIA Rule 31(1)', 'BIA Rule 150', 'OSB Directive No. 18R', 'BIA s. 121-128']
              }
            }
          });
          
        console.log('Created new analysis with Form 31 risks');
      }
    }
    
    // Update document with risk assessment status
    await updateAnalysisStatus(documentRecord, 'risk_assessment', 'extraction_completed');
    console.log('Risk assessment completed successfully');
    
  } catch (error) {
    console.error('Error in risk assessment stage:', error);
    // Continue with the process even if risk assessment fails partially
  }
};
