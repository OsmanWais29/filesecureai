
import { supabase } from '@/lib/supabase';

export class RiskAssessmentTaskService {
  /**
   * Handle risk assessment and auto-task creation
   */
  static async handleRiskAssessmentTasks(documentId: string, analysis: any) {
    const highRiskFactors = analysis.riskAssessment?.riskFactors?.filter(
      risk => risk.severity === 'high'
    ) || [];

    // Create tasks for high-risk findings
    for (const risk of highRiskFactors) {
      await supabase
        .from('tasks')
        .insert({
          title: `HIGH RISK: ${risk.type} - ${analysis.formNumber}`,
          description: `${risk.description}\n\nRecommended Action: ${risk.recommendation}\n\nBIA Reference: ${risk.biaReference}\n\nField Location: ${risk.fieldLocation}`,
          document_id: documentId,
          priority: 'high',
          status: 'todo',
          auto_created: true,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {
            riskType: risk.type,
            severity: risk.severity,
            fieldLocation: risk.fieldLocation,
            biaReference: risk.biaReference,
            autoCreatedByDeepSeek: true,
            analysisConfidence: analysis.confidence
          }
        });
    }

    // Create notification for risk findings
    if (highRiskFactors.length > 0) {
      await supabase.functions.invoke('handle-notifications', {
        body: {
          action: 'create',
          userId: analysis.userId || 'system',
          notification: {
            title: 'High Risk Issues Detected',
            message: `${highRiskFactors.length} high-risk issues found in ${analysis.formType}`,
            type: 'warning',
            category: 'risk_assessment',
            priority: 'high',
            metadata: {
              documentId,
              riskCount: highRiskFactors.length,
              formType: analysis.formType
            }
          }
        }
      });
    }
  }
}
