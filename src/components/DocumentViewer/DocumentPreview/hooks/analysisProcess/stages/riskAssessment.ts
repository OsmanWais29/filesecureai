
export const extractRisksFromAnalysis = (analysisData: any) => {
  if (!analysisData || !analysisData.risks || !Array.isArray(analysisData.risks)) {
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
    return {};
  }
  
  // Extract form type and number information
  const formInfo = analysisData.extracted_info?.formType 
    ? `Form ${analysisData.extracted_info.formNumber || 'Unknown'} - ${analysisData.extracted_info.formType}`
    : 'Unknown Form Type';

  // Extract summary
  const summary = analysisData.extracted_info?.summary || 'No summary available';
  
  // Extract risks
  const risks = extractRisksFromAnalysis(analysisData);
  
  // Generate risk summary
  let riskSummary = 'No risks detected';
  if (risks && risks.length > 0) {
    const highRisks = risks.filter(risk => risk.severity === 'high');
    const mediumRisks = risks.filter(risk => risk.severity === 'medium');
    const lowRisks = risks.filter(risk => risk.severity === 'low');
    
    riskSummary = `Detected ${risks.length} issue${risks.length !== 1 ? 's' : ''}: ` +
      `${highRisks.length} high, ${mediumRisks.length} medium, ${lowRisks.length} low`;
  }
  
  return {
    formInfo,
    summary,
    risks,
    riskSummary
  };
};

// Export the risk assessment function to be used by the analysis process
export const riskAssessment = {
  extractRisksFromAnalysis,
  processExtractedInfo,
  generateAnalysisSection
};
