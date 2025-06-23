
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface EnhancedAnalysisResult {
  documentId: string;
  formType: string;
  formNumber: string;
  confidence: number;
  extractedFields: Record<string, any>;
  riskAssessment: RiskAssessment;
  complianceStatus: ComplianceStatus;
  recommendations: string[];
  processingSteps: ProcessingStep[];
  deepseekReasoning: string;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  riskFactors: RiskFactor[];
  criticalIssues: string[];
  complianceGaps: string[];
  deadlineRisks: DeadlineRisk[];
}

export interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
  biaReference: string;
}

export interface ComplianceStatus {
  biaCompliant: boolean;
  osbCompliant: boolean;
  missingFields: string[];
  invalidData: string[];
  signatureIssues: string[];
}

export interface ProcessingStep {
  step: string;
  status: 'completed' | 'failed' | 'skipped';
  details: string;
  confidence: number;
}

export interface DeadlineRisk {
  type: string;
  deadline: string;
  daysRemaining: number;
  priority: 'low' | 'medium' | 'high';
}

export class EnhancedDocumentAnalysis {
  /**
   * Main analysis function that processes documents through DeepSeek AI
   */
  static async analyzeDocument(
    documentId: string,
    options: {
      includeRiskAssessment?: boolean;
      includeComplianceCheck?: boolean;
      generateTasks?: boolean;
      customPrompt?: string;
    } = {}
  ): Promise<EnhancedAnalysisResult | null> {
    try {
      console.log('Starting enhanced document analysis with DeepSeek AI:', documentId);
      
      // Get document details
      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error || !document) {
        throw new Error('Document not found');
      }

      // Update document status
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'processing',
          metadata: {
            ...document.metadata,
            analysis_started: new Date().toISOString(),
            processing_stage: 'enhanced_analysis'
          }
        })
        .eq('id', documentId);

      // Call DeepSeek analysis edge function
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('enhanced-document-analysis', {
        body: {
          documentId,
          documentTitle: document.title,
          documentMetadata: document.metadata,
          storagePath: document.storage_path,
          analysisOptions: {
            includeRiskAssessment: options.includeRiskAssessment ?? true,
            includeComplianceCheck: options.includeComplianceCheck ?? true,
            generateTasks: options.generateTasks ?? true,
            customPrompt: options.customPrompt,
            deepAnalysis: true,
            biaCompliance: true
          }
        }
      });

      if (analysisError) {
        throw new Error(`Analysis failed: ${analysisError.message}`);
      }

      if (!analysisResult?.success) {
        throw new Error(analysisResult?.error || 'Analysis failed');
      }

      // Update document with analysis results
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'complete',
          metadata: {
            ...document.metadata,
            analysis_complete: true,
            analysis_completed_at: new Date().toISOString(),
            enhanced_analysis: true,
            deepseek_processed: true,
            form_type: analysisResult.analysis.formType,
            form_number: analysisResult.analysis.formNumber,
            confidence_score: analysisResult.analysis.confidence,
            risk_level: analysisResult.analysis.riskAssessment.overallRisk
          }
        })
        .eq('id', documentId);

      // Store detailed analysis results
      await this.storeAnalysisResults(documentId, analysisResult.analysis);

      // Generate tasks if requested
      if (options.generateTasks && analysisResult.analysis.riskAssessment.riskFactors.length > 0) {
        await this.generateTasksFromAnalysis(documentId, analysisResult.analysis);
      }

      toast.success('Enhanced document analysis completed', {
        description: `Analyzed ${analysisResult.analysis.formType} with ${analysisResult.analysis.confidence}% confidence`
      });

      return analysisResult.analysis;

    } catch (error) {
      console.error('Enhanced document analysis failed:', error);
      
      // Update document status to failed
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'failed',
          metadata: {
            analysis_error: error.message,
            analysis_failed_at: new Date().toISOString()
          }
        })
        .eq('id', documentId);

      toast.error('Document analysis failed', {
        description: error.message
      });

      return null;
    }
  }

  /**
   * Store detailed analysis results in the database
   */
  private static async storeAnalysisResults(documentId: string, analysis: EnhancedAnalysisResult) {
    try {
      // Store in document_analysis table
      await supabase
        .from('document_analysis')
        .upsert({
          document_id: documentId,
          content: JSON.stringify(analysis),
          updated_at: new Date().toISOString()
        });

      // Store risk assessments
      if (analysis.riskAssessment.riskFactors.length > 0) {
        for (const risk of analysis.riskAssessment.riskFactors) {
          await supabase
            .from('osb_risk_assessments')
            .insert({
              analysis_id: documentId,
              risk_type: risk.type,
              severity: risk.severity,
              description: risk.description,
              suggested_action: risk.recommendation,
              regulation_reference: risk.biaReference
            });
        }
      }

    } catch (error) {
      console.error('Failed to store analysis results:', error);
    }
  }

  /**
   * Generate tasks from analysis results
   */
  private static async generateTasksFromAnalysis(documentId: string, analysis: EnhancedAnalysisResult) {
    try {
      // Call the AI task generator
      const { data: taskResult } = await supabase.functions.invoke('ai-task-generator', {
        body: {
          documentId,
          riskAssessments: analysis.riskAssessment.riskFactors,
          formNumber: analysis.formNumber,
          documentAnalysis: analysis
        }
      });

      if (taskResult?.success) {
        console.log(`Generated ${taskResult.task_count} tasks from analysis`);
      }
    } catch (error) {
      console.error('Failed to generate tasks from analysis:', error);
    }
  }

  /**
   * Get analysis results for a document
   */
  static async getAnalysisResults(documentId: string): Promise<EnhancedAnalysisResult | null> {
    try {
      const { data, error } = await supabase
        .from('document_analysis')
        .select('content')
        .eq('document_id', documentId)
        .single();

      if (error || !data) {
        return null;
      }

      return JSON.parse(data.content);
    } catch (error) {
      console.error('Failed to get analysis results:', error);
      return null;
    }
  }

  /**
   * Batch analyze multiple documents
   */
  static async batchAnalyze(documentIds: string[]): Promise<void> {
    const promises = documentIds.map(id => this.analyzeDocument(id));
    await Promise.allSettled(promises);
  }
}
