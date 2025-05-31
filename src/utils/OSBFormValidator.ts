
// OSB Form Validation Utilities
import { DeepSeekAnalysisResponse, IdentifiedRisk } from '@/types/osb-analysis';

export class OSBFormValidator {
  static validateAnalysisResponse(response: any): DeepSeekAnalysisResponse {
    // Validate required fields
    if (!response.document_details) {
      throw new Error('Missing document_details');
    }
    if (!response.comprehensive_risk_assessment) {
      throw new Error('Missing comprehensive_risk_assessment');
    }

    // Validate enums
    const validRiskLevels = ['low', 'medium', 'high'];
    if (!validRiskLevels.includes(response.comprehensive_risk_assessment.overall_risk_level)) {
      throw new Error('Invalid overall_risk_level');
    }

    const validStatuses = ['complete', 'partial', 'failed'];
    if (!validStatuses.includes(response.document_details.processing_status)) {
      throw new Error('Invalid processing_status');
    }

    return response as DeepSeekAnalysisResponse;
  }

  static calculateRiskScore(risks: IdentifiedRisk[]): number {
    const weights = { high: 10, medium: 5, low: 1 };
    return risks.reduce((score, risk) => score + weights[risk.severity], 0);
  }

  static getCompliancePercentage(analysis: DeepSeekAnalysisResponse): number {
    const flags = analysis.comprehensive_risk_assessment.validation_flags;
    const total = Object.keys(flags).length;
    const passed = Object.values(flags).filter(Boolean).length;
    return Math.round((passed / total) * 100);
  }

  static formatRiskLevel(level: 'low' | 'medium' | 'high'): { color: string; label: string } {
    const levels = {
      low: { color: 'text-green-600', label: 'Low Risk' },
      medium: { color: 'text-yellow-600', label: 'Medium Risk' },
      high: { color: 'text-red-600', label: 'High Risk' }
    };
    return levels[level];
  }

  static getFormCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'creditor_forms': '🏛️',
      'proposal_forms': '📝',
      'bankruptcy_forms': '⚖️',
      'financial_statements': '💰',
      'information_forms': 'ℹ️',
      'completion_forms': '✅'
    };
    return icons[category] || '📄';
  }
}
