
export const extractRisksFromAnalysis = (analysisData: any) => {
  if (!analysisData || !analysisData.risks) {
    return [];
  }
  return analysisData.risks;
};

export const processExtractedInfo = (analysisData: any) => {
  if (!analysisData || !analysisData.extracted_info) {
    return {};
  }
  return analysisData.extracted_info;
};

export const generateAnalysisSection = (analysisData: any) => {
  if (!analysisData) {
    return [];
  }
  
  const sections = [];
  
  if (analysisData.extracted_info) {
    sections.push({
      title: 'Document Information',
      content: analysisData.extracted_info
    });
  }
  
  if (analysisData.risks && analysisData.risks.length > 0) {
    sections.push({
      title: 'Risk Assessment',
      content: analysisData.risks
    });
  }
  
  return sections;
};

export const riskAssessment = {
  description: 'Assessing document risks and compliance',
  detailedDescription: 'Analyzing the document for potential compliance issues and risks',
  extractRisksFromAnalysis,
  processExtractedInfo,
  generateAnalysisSection
};
