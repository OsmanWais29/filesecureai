
import { supabase } from '@/lib/supabase';
import { DeepSeekAnalysisResult } from './DeepSeekCoreService';
import { toast } from 'sonner';

export class RiskAssessmentTaskService {
  static async handleRiskAssessmentTasks(documentId: string, analysis: DeepSeekAnalysisResult): Promise<void> {
    try {
      const highRiskFactors = analysis.riskAssessment?.riskFactors?.filter(
        risk => risk.severity === 'high'
      ) || [];

      // Create tasks for high-risk findings
      for (const risk of highRiskFactors) {
        const { error: taskError } = await supabase
          .from('tasks')
          .insert({
            title: `HIGH RISK: ${risk.type} - ${analysis.formIdentification.formType}`,
            description: `${risk.description}\n\nRecommended Action: ${risk.recommendation}\n\nBIA Reference: ${risk.biaReference}\n\nField Location: ${risk.fieldLocation}`,
            document_id: documentId,
            priority: 'high',
            status: 'pending',
            ai_generated: true,
            severity: 'high',
            due_date: risk.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_by: (await supabase.auth.getUser()).data.user?.id || '',
            metadata: {
              risk_type: risk.type,
              severity: risk.severity,
              field_location: risk.fieldLocation,
              bia_reference: risk.biaReference,
              auto_created_by_deepseek: true,
              analysis_confidence: analysis.metadata.analysisConfidence
            }
          });

        if (taskError) {
          console.error('Failed to create task for risk:', taskError);
        }
      }

      // Store individual risk assessments
      for (const risk of analysis.riskAssessment?.riskFactors || []) {
        const { error: riskError } = await supabase
          .from('osb_risk_assessments')
          .insert({
            analysis_id: documentId,
            risk_type: risk.type,
            severity: risk.severity,
            description: risk.description,
            suggested_action: risk.recommendation,
            regulation_reference: risk.biaReference,
            field_location: risk.fieldLocation,
            deadline_impact: !!risk.deadline
          });

        if (riskError) {
          console.error('Failed to store risk assessment:', riskError);
        }
      }

      if (highRiskFactors.length > 0) {
        toast.warning(`${highRiskFactors.length} high-risk issues detected and tasks created`);
      }

    } catch (error) {
      console.error('Risk assessment task creation failed:', error);
    }
  }
}
