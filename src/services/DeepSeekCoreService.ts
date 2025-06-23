
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface DeepSeekAnalysisResult {
  documentId: string;
  formType: string;
  formNumber: string;
  confidence: number;
  clientName: string;
  estateNumber: string;
  trusteeName: string;
  extractedFields: Record<string, any>;
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high';
    riskFactors: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      recommendation: string;
      biaReference: string;
      fieldLocation: string;
    }>;
    missingFields: string[];
    signatureIssues: string[];
    complianceGaps: string[];
  };
  processingSteps: Array<{
    step: string;
    status: 'completed' | 'failed';
    confidence: number;
  }>;
  reasoning: string;
}

export class DeepSeekCoreService {
  /**
   * Core DeepSeek analysis - the nucleus of the AI system
   */
  static async analyzeDocument(documentId: string): Promise<DeepSeekAnalysisResult | null> {
    try {
      console.log('🧠 DeepSeek Core Analysis Starting:', documentId);
      
      // Get document details
      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error || !document) {
        throw new Error('Document not found');
      }

      // Update processing status
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'processing',
          metadata: {
            ...document.metadata,
            deepseek_analysis_started: new Date().toISOString(),
            processing_stage: 'deepseek_core_analysis'
          }
        })
        .eq('id', documentId);

      // Call enhanced DeepSeek analysis
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('deepseek-core-analysis', {
        body: {
          documentId,
          storagePath: document.storage_path,
          documentTitle: document.title,
          analysisMode: 'comprehensive',
          includeFormRecognition: true,
          includeBIACompliance: true,
          includeRiskAssessment: true,
          includeClientExtraction: true
        }
      });

      if (analysisError) {
        throw new Error(`DeepSeek analysis failed: ${analysisError.message}`);
      }

      if (!analysisResult?.success) {
        throw new Error(analysisResult?.error || 'DeepSeek analysis failed');
      }

      const analysis = analysisResult.analysis as DeepSeekAnalysisResult;

      // Store analysis results
      await this.storeAnalysisResults(documentId, analysis);

      // Auto-categorize based on analysis
      await this.autoCategorizeBas edOnAnalysis(documentId, analysis);

      // Auto-create tasks from high-risk findings
      await this.autoCreateTasksFromRisks(documentId, analysis);

      toast.success('DeepSeek AI analysis completed', {
        description: `Analyzed ${analysis.formType} with ${analysis.confidence}% confidence`
      });

      return analysis;

    } catch (error) {
      console.error('❌ DeepSeek Core Analysis failed:', error);
      
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'failed',
          metadata: {
            deepseek_error: error.message,
            analysis_failed_at: new Date().toISOString()
          }
        })
        .eq('id', documentId);

      toast.error('DeepSeek analysis failed', {
        description: error.message
      });

      return null;
    }
  }

  /**
   * Store comprehensive analysis results
   */
  private static async storeAnalysisResults(documentId: string, analysis: DeepSeekAnalysisResult) {
    try {
      // Store in document_analysis table
      await supabase
        .from('document_analysis')
        .upsert({
          document_id: documentId,
          content: JSON.stringify(analysis),
          form_type: analysis.formType,
          form_number: analysis.formNumber,
          confidence_score: analysis.confidence,
          client_name: analysis.clientName,
          estate_number: analysis.estateNumber,
          risk_level: analysis.riskAssessment.overallRisk,
          updated_at: new Date().toISOString()
        });

      // Store individual risk assessments
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
            created_at: new Date().toISOString()
          });
      }

      // Update document metadata with extracted info
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'complete',
          metadata: {
            deepseek_analysis_complete: true,
            form_type: analysis.formType,
            form_number: analysis.formNumber,
            client_name: analysis.clientName,
            estate_number: analysis.estateNumber,
            trustee_name: analysis.trusteeName,
            confidence_score: analysis.confidence,
            risk_level: analysis.riskAssessment.overallRisk,
            extracted_fields: analysis.extractedFields,
            analysis_completed_at: new Date().toISOString()
          }
        })
        .eq('id', documentId);

    } catch (error) {
      console.error('Failed to store DeepSeek analysis results:', error);
    }
  }

  /**
   * Auto-categorize document based on DeepSeek analysis
   */
  private static async autoCategorizeBas edOnAnalysis(documentId: string, analysis: DeepSeekAnalysisResult) {
    try {
      if (analysis.clientName && analysis.formType) {
        const clientFolderName = analysis.clientName.trim();
        const documentType = `${analysis.formNumber} - ${analysis.formType}`;

        // Create or get client folder
        const { data: clientFolder, error: folderError } = await supabase
          .from('document_folders')
          .upsert({
            name: clientFolderName,
            type: 'client',
            parent_id: null,
            metadata: {
              client_name: analysis.clientName,
              estate_number: analysis.estateNumber
            }
          })
          .select()
          .single();

        if (!folderError && clientFolder) {
          // Create form type subfolder
          const { data: formFolder } = await supabase
            .from('document_folders')
            .upsert({
              name: documentType,
              type: 'form',
              parent_id: clientFolder.id,
              metadata: {
                form_number: analysis.formNumber,
                form_type: analysis.formType
              }
            })
            .select()
            .single();

          // Move document to proper folder
          if (formFolder) {
            await supabase
              .from('documents')
              .update({
                parent_folder_id: formFolder.id,
                metadata: {
                  auto_categorized: true,
                  categorized_at: new Date().toISOString(),
                  client_name: analysis.clientName,
                  form_type: analysis.formType,
                  form_number: analysis.formNumber
                }
              })
              .eq('id', documentId);

            console.log(`✅ Auto-categorized document to: ${clientFolderName} > ${documentType}`);
          }
        }
      }
    } catch (error) {
      console.error('Auto-categorization failed:', error);
    }
  }

  /**
   * Auto-create tasks from high-risk findings
   */
  private static async autoCreateTasksFromRisks(documentId: string, analysis: DeepSeekAnalysisResult) {
    try {
      const highRiskFactors = analysis.riskAssessment.riskFactors.filter(
        risk => risk.severity === 'high'
      );

      for (const risk of highRiskFactors) {
        await supabase
          .from('tasks')
          .insert({
            title: `${risk.type}: ${analysis.formNumber}`,
            description: `${risk.description}\n\nRecommendation: ${risk.recommendation}\n\nBIA Reference: ${risk.biaReference}`,
            document_id: documentId,
            priority: 'high',
            status: 'todo',
            auto_created: true,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            metadata: {
              risk_type: risk.type,
              field_location: risk.fieldLocation,
              bia_reference: risk.biaReference,
              created_by_deepseek: true
            }
          });
      }

      if (highRiskFactors.length > 0) {
        console.log(`✅ Auto-created ${highRiskFactors.length} tasks from high-risk findings`);
      }
    } catch (error) {
      console.error('Auto-task creation failed:', error);
    }
  }

  /**
   * Get stored analysis for a document
   */
  static async getAnalysis(documentId: string): Promise<DeepSeekAnalysisResult | null> {
    try {
      const { data, error } = await supabase
        .from('document_analysis')
        .select('content')
        .eq('document_id', documentId)
        .single();

      if (error || !data) return null;

      return JSON.parse(data.content) as DeepSeekAnalysisResult;
    } catch (error) {
      console.error('Failed to get analysis:', error);
      return null;
    }
  }
}
