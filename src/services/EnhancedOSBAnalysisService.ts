
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface OSBFormAnalysis {
  formNumber: string;
  formType: string;
  confidence: number;
  extractedData: Record<string, any>;
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high';
    riskFactors: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      biaReference: string;
      recommendation: string;
      fieldLocation: string;
    }>;
    missingFields: string[];
    signatureIssues: string[];
    complianceGaps: string[];
  };
  clientExtraction: {
    clientName?: string;
    estateNumber?: string;
    debtorInfo?: Record<string, any>;
    trusteeName?: string;
  };
}

export class EnhancedOSBAnalysisService {
  /**
   * Analyze OSB form with comprehensive DeepSeek AI processing
   */
  static async analyzeOSBForm(documentId: string): Promise<OSBFormAnalysis | null> {
    try {
      console.log('🏛️ Enhanced OSB Analysis Starting:', documentId);

      // Get document details
      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error || !document) {
        throw new Error('Document not found for OSB analysis');
      }

      // Call enhanced OSB analysis edge function
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('enhanced-osb-analysis', {
        body: {
          documentId,
          storagePath: document.storage_path,
          documentTitle: document.title,
          analysisMode: 'comprehensive_osb',
          includeFormRecognition: true,
          includeBIACompliance: true,
          includeRiskAssessment: true,
          includeClientExtraction: true,
          includeSignatureDetection: true,
          includeMissingFieldDetection: true,
          formSpecific: true
        }
      });

      if (analysisError) {
        throw new Error(`OSB analysis failed: ${analysisError.message}`);
      }

      if (!analysisResult?.success) {
        throw new Error(analysisResult?.error || 'OSB analysis failed');
      }

      const analysis = analysisResult.analysis as OSBFormAnalysis;

      // Store comprehensive OSB analysis results
      await this.storeOSBAnalysisResults(documentId, analysis);

      // Trigger OSB-specific workflows
      await this.triggerOSBWorkflows(documentId, analysis);

      toast.success('OSB Form Analysis Complete', {
        description: `${analysis.formType} analyzed - ${analysis.riskAssessment.overallRisk} risk detected`
      });

      return analysis;

    } catch (error) {
      console.error('❌ Enhanced OSB Analysis failed:', error);
      
      toast.error('OSB Analysis failed', {
        description: error.message
      });

      return null;
    }
  }

  /**
   * Store comprehensive OSB analysis results
   */
  private static async storeOSBAnalysisResults(documentId: string, analysis: OSBFormAnalysis) {
    try {
      // Store in specialized OSB analysis table
      await supabase
        .from('osb_form_analysis')
        .upsert({
          document_id: documentId,
          form_number: analysis.formNumber,
          form_type: analysis.formType,
          confidence_score: analysis.confidence,
          extracted_data: analysis.extractedData,
          client_name: analysis.clientExtraction.clientName,
          estate_number: analysis.clientExtraction.estateNumber,
          trustee_name: analysis.clientExtraction.trusteeName,
          risk_level: analysis.riskAssessment.overallRisk,
          missing_fields: analysis.riskAssessment.missingFields,
          signature_issues: analysis.riskAssessment.signatureIssues,
          compliance_gaps: analysis.riskAssessment.complianceGaps,
          analysis_metadata: {
            analysisCompletedAt: new Date().toISOString(),
            riskFactorCount: analysis.riskAssessment.riskFactors.length,
            debtorInfo: analysis.clientExtraction.debtorInfo
          },
          updated_at: new Date().toISOString()
        });

      // Store individual risk assessments with OSB context
      for (const risk of analysis.riskAssessment.riskFactors) {
        await supabase
          .from('osb_risk_assessments')
          .insert({
            analysis_id: documentId,
            risk_type: risk.type,
            severity: risk.severity,
            description: risk.description,
            suggested_action: risk.recommendation,
            regulation_reference: risk.biaReference,
            field_location: risk.fieldLocation,
            form_specific: true,
            osb_category: this.categorizeOSBRisk(risk.type),
            deadline_impact: this.assessDeadlineImpact(risk.type),
            created_at: new Date().toISOString()
          });
      }

      // Update main document with OSB-specific metadata
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'complete',
          metadata: {
            osbAnalysisComplete: true,
            formNumber: analysis.formNumber,
            formType: analysis.formType,
            clientName: analysis.clientExtraction.clientName,
            estateNumber: analysis.clientExtraction.estateNumber,
            trusteeName: analysis.clientExtraction.trusteeName,
            riskLevel: analysis.riskAssessment.overallRisk,
            confidenceScore: analysis.confidence,
            osbSpecific: true,
            analysisCompletedAt: new Date().toISOString()
          }
        })
        .eq('id', documentId);

    } catch (error) {
      console.error('Failed to store OSB analysis results:', error);
    }
  }

  /**
   * Trigger OSB-specific workflows and automations
   */
  private static async triggerOSBWorkflows(documentId: string, analysis: OSBFormAnalysis) {
    try {
      // Create OSB compliance tasks
      const complianceTasks = analysis.riskAssessment.complianceGaps.map(gap => ({
        title: `OSB Compliance: ${gap}`,
        description: `Compliance gap detected in ${analysis.formType}\n\nForm: ${analysis.formNumber}\nClient: ${analysis.clientExtraction.clientName}\nEstate: ${analysis.clientExtraction.estateNumber}`,
        document_id: documentId,
        priority: 'high',
        status: 'todo',
        auto_created: true,
        due_date: this.calculateComplianceDeadline(gap),
        metadata: {
          taskType: 'osb_compliance',
          formNumber: analysis.formNumber,
          complianceGap: gap,
          estateNumber: analysis.clientExtraction.estateNumber
        }
      }));

      if (complianceTasks.length > 0) {
        await supabase
          .from('tasks')
          .insert(complianceTasks);
      }

      // Create missing field tasks
      const missingFieldTasks = analysis.riskAssessment.missingFields.map(field => ({
        title: `Missing Field: ${field}`,
        description: `Required field missing in ${analysis.formType}\n\nField: ${field}\nForm: ${analysis.formNumber}\nClient: ${analysis.clientExtraction.clientName}`,
        document_id: documentId,
        priority: 'medium',
        status: 'todo',
        auto_created: true,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          taskType: 'missing_field',
          fieldName: field,
          formNumber: analysis.formNumber
        }
      }));

      if (missingFieldTasks.length > 0) {
        await supabase
          .from('tasks')
          .insert(missingFieldTasks);
      }

      // Create signature issue tasks
      const signatureTasks = analysis.riskAssessment.signatureIssues.map(issue => ({
        title: `Signature Issue: ${issue}`,
        description: `Signature problem detected in ${analysis.formType}\n\nIssue: ${issue}\nForm: ${analysis.formNumber}\nClient: ${analysis.clientExtraction.clientName}`,
        document_id: documentId,
        priority: 'high',
        status: 'todo',
        auto_created: true,
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          taskType: 'signature_issue',
          signatureIssue: issue,
          formNumber: analysis.formNumber
        }
      }));

      if (signatureTasks.length > 0) {
        await supabase
          .from('tasks')
          .insert(signatureTasks);
      }

    } catch (error) {
      console.error('Failed to trigger OSB workflows:', error);
    }
  }

  /**
   * Categorize OSB-specific risks
   */
  private static categorizeOSBRisk(riskType: string): string {
    const riskCategories = {
      'Missing Signature': 'execution',
      'Incomplete Information': 'data_integrity',
      'Date Inconsistency': 'temporal',
      'Missing Required Field': 'completeness',
      'Calculation Error': 'mathematical',
      'BIA Non-Compliance': 'regulatory'
    };

    return riskCategories[riskType] || 'general';
  }

  /**
   * Assess if risk impacts critical deadlines
   */
  private static assessDeadlineImpact(riskType: string): boolean {
    const deadlineImpactingRisks = [
      'Missing Signature',
      'BIA Non-Compliance',
      'Missing Required Field',
      'Court Filing Deadline'
    ];

    return deadlineImpactingRisks.includes(riskType);
  }

  /**
   * Calculate compliance deadline based on gap type
   */
  private static calculateComplianceDeadline(gap: string): string {
    const urgentGaps = ['Court Filing', 'OSB Reporting', 'Creditor Notice'];
    const days = urgentGaps.some(urgent => gap.includes(urgent)) ? 2 : 7;
    
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  /**
   * Get comprehensive OSB analysis for a document
   */
  static async getOSBAnalysis(documentId: string): Promise<OSBFormAnalysis | null> {
    try {
      const { data, error } = await supabase
        .from('osb_form_analysis')
        .select('*')
        .eq('document_id', documentId)
        .single();

      if (error || !data) return null;

      return {
        formNumber: data.form_number,
        formType: data.form_type,
        confidence: data.confidence_score,
        extractedData: data.extracted_data,
        riskAssessment: {
          overallRisk: data.risk_level,
          riskFactors: [], // Would need to fetch from osb_risk_assessments
          missingFields: data.missing_fields,
          signatureIssues: data.signature_issues,
          complianceGaps: data.compliance_gaps
        },
        clientExtraction: {
          clientName: data.client_name,
          estateNumber: data.estate_number,
          trusteeName: data.trustee_name,
          debtorInfo: data.analysis_metadata?.debtorInfo
        }
      };
    } catch (error) {
      console.error('Failed to get OSB analysis:', error);
      return null;
    }
  }
}
