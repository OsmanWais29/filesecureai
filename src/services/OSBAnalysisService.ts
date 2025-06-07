
// OSB Analysis Service - Main entry point for OSB analysis functionality
import { OSBDocumentService } from './osb/OSBDocumentService';
import { OSBComplianceService } from './osb/OSBComplianceService';
import { OSBTestingService } from './osb/OSBTestingService';
import { OSBDeepSeekService } from './osb/OSBDeepSeekService';

export class OSBAnalysisService {
  // Re-export all methods from sub-services to maintain backwards compatibility
  static analyzeDocument = OSBDeepSeekService.analyzeDocument;
  static getAnalysisById = OSBDocumentService.getAnalysisById;
  static getAnalysesByForm = OSBDocumentService.getAnalysesByForm;
  static getHighRiskAnalyses = OSBDocumentService.getHighRiskAnalyses;
  static getComplianceSummary = OSBComplianceService.getComplianceSummary;
  static getOSBFormsReference = OSBDocumentService.getOSBFormsReference;
  static updateRiskResolution = OSBComplianceService.updateRiskResolution;
  static testPDFAnalysis = OSBTestingService.testPDFAnalysis;
  static triggerDeepSeekAnalysis = OSBDeepSeekService.triggerDeepSeekAnalysis;
}

// Also export individual services for direct use
export { OSBDocumentService, OSBComplianceService, OSBTestingService, OSBDeepSeekService };
