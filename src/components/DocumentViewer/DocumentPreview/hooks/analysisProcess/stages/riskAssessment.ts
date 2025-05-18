import { Risk } from "@/components/DocumentViewer/types";

export const extractRisksFromAnalysis = (analysisData: any): Risk[] => {
  try {
    if (!analysisData) return [];
    
    // Safe access with type checking for risks
    if (analysisData && typeof analysisData === 'object' && 'risks' in analysisData) {
      return (analysisData.risks as any[]) || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error extracting risks:', error);
    return [];
  }
};

export const processExtractedInfo = (analysisData: any): any => {
  if (!analysisData || typeof analysisData !== 'object') return {};
  
  // Safe access with type checking
  const extractedInfo = 'extracted_info' in analysisData ? analysisData.extracted_info : null;
  
  if (!extractedInfo) return {};
  return extractedInfo;
};

export const generateAnalysisSection = (analysisData: any): string => {
  try {
    let analysisText = '';

    // Safe access with type checking
    const extractedInfo = analysisData && typeof analysisData === 'object' && 'extracted_info' in analysisData 
      ? analysisData.extracted_info 
      : null;
    
    if (extractedInfo) {
      analysisText += 'Extracted Information:\n';
      for (const key in extractedInfo) {
        analysisText += `- ${key}: ${extractedInfo[key]}\n`;
      }
    }

    const risks = analysisData && typeof analysisData === 'object' && 'risks' in analysisData 
      ? analysisData.risks 
      : null;
    
    if (risks && Array.isArray(risks)) {
      analysisText += '\nRisks:\n';
      risks.forEach((risk: Risk) => {
        analysisText += `- Type: ${risk.type}, Description: ${risk.description}, Severity: ${risk.severity}\n`;
      });
    }

    return analysisText || 'No analysis available.';
  } catch (error) {
    console.error('Error generating analysis section:', error);
    return 'Error generating analysis.';
  }
};
