
import { supabase } from '@/lib/supabase';
import { DeepSeekCoreService } from './DeepSeekCoreService';
import { FileVersioningService } from './FileVersioningService';
import { DuplicatePreventionService } from './DuplicatePreventionService';
import { toast } from 'sonner';

export interface DocumentProcessingPipeline {
  documentId: string;
  stage: 'upload' | 'duplicate_check' | 'ai_analysis' | 'categorization' | 'risk_assessment' | 'complete';
  progress: number;
  errors: string[];
  metadata: Record<string, any>;
}

export class DeepSeekAnalysisOrchestrator {
  /**
   * Complete document processing pipeline with DeepSeek AI as the nucleus
   */
  static async processDocumentPipeline(
    file: File,
    userId: string,
    options: {
      skipDuplicateCheck?: boolean;
      forceAnalysis?: boolean;
      clientHint?: string;
    } = {}
  ): Promise<{ success: boolean; documentId?: string; pipeline?: DocumentProcessingPipeline }> {
    
    const pipeline: DocumentProcessingPipeline = {
      documentId: '',
      stage: 'upload',
      progress: 0,
      errors: [],
      metadata: {}
    };

    try {
      // Stage 1: Duplicate Prevention
      pipeline.stage = 'duplicate_check';
      pipeline.progress = 10;
      
      if (!options.skipDuplicateCheck) {
        const duplicateResult = await DuplicatePreventionService.checkForDuplicates(file, userId);
        
        if (duplicateResult.isDuplicate && !options.forceAnalysis) {
          return {
            success: false,
            pipeline: {
              ...pipeline,
              errors: ['Duplicate file detected - use version system or force upload']
            }
          };
        }
        
        pipeline.metadata.duplicateCheck = duplicateResult;
      }

      // Stage 2: Document Upload & Initial Record Creation
      pipeline.progress = 25;
      const documentId = await this.createDocumentRecord(file, userId, options.clientHint);
      pipeline.documentId = documentId;

      // Stage 3: DeepSeek AI Analysis (THE NUCLEUS)
      pipeline.stage = 'ai_analysis';
      pipeline.progress = 40;
      
      toast.info('DeepSeek AI Analysis Starting', {
        description: 'Advanced form recognition and risk assessment in progress'
      });

      const analysisResult = await DeepSeekCoreService.analyzeDocument(documentId);
      
      if (!analysisResult) {
        pipeline.errors.push('DeepSeek AI analysis failed');
        return { success: false, pipeline };
      }

      pipeline.metadata.analysis = analysisResult;

      // Stage 4: Auto-Categorization Based on AI Results
      pipeline.stage = 'categorization';
      pipeline.progress = 65;

      await this.handleAutoCategorization(documentId, analysisResult);

      // Stage 5: Risk Assessment & Task Generation
      pipeline.stage = 'risk_assessment';
      pipeline.progress = 80;

      await this.handleRiskAssessmentTasks(documentId, analysisResult);

      // Stage 6: Version Management
      pipeline.progress = 90;
      await FileVersioningService.createVersion(documentId, file, 'Initial upload');

      // Stage 7: Complete
      pipeline.stage = 'complete';
      pipeline.progress = 100;

      toast.success('Document processing complete', {
        description: `${analysisResult.formType} analyzed with ${analysisResult.confidence}% confidence`
      });

      return { success: true, documentId, pipeline };

    } catch (error) {
      console.error('Document processing pipeline failed:', error);
      pipeline.errors.push(error.message);
      
      toast.error('Document processing failed', {
        description: error.message
      });

      return { success: false, pipeline };
    }
  }

  /**
   * Create enhanced document record with metadata preparation
   */
  private static async createDocumentRecord(
    file: File, 
    userId: string, 
    clientHint?: string
  ): Promise<string> {
    const timestamp = new Date().toISOString();
    const fileExt = file.name.split('.').pop();
    const storagePath = `${userId}/${timestamp.replace(/[:.]/g, '-')}_${file.name}`;

    // Upload to storage first
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file);

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Create document record with enhanced metadata
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        title: file.name,
        storage_path: storagePath,
        type: file.type,
        size: file.size,
        user_id: userId,
        ai_processing_status: 'pending',
        metadata: {
          originalName: file.name,
          uploadedAt: timestamp,
          fileExtension: fileExt,
          clientHint: clientHint,
          processingStage: 'created',
          deepseekAnalysisPending: true
        }
      })
      .select()
      .single();

    if (docError || !document) {
      throw new Error(`Document record creation failed: ${docError?.message}`);
    }

    return document.id;
  }

  /**
   * Handle auto-categorization based on DeepSeek analysis
   */
  private static async handleAutoCategorization(documentId: string, analysis: any) {
    if (!analysis.clientName || !analysis.formType) return;

    try {
      // Create client folder structure
      const { data: clientFolder, error: folderError } = await supabase
        .from('document_folders')
        .upsert({
          name: analysis.clientName,
          type: 'client',
          metadata: {
            clientName: analysis.clientName,
            estateNumber: analysis.estateNumber,
            autoCreated: true,
            createdAt: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (!folderError && clientFolder) {
        // Create form type subfolder
        const formFolderName = `${analysis.formNumber} - ${analysis.formType}`;
        const { data: formFolder } = await supabase
          .from('document_folders')
          .upsert({
            name: formFolderName,
            type: 'form',
            parent_id: clientFolder.id,
            metadata: {
              formNumber: analysis.formNumber,
              formType: analysis.formType,
              autoCreated: true
            }
          })
          .select()
          .single();

        // Move document to appropriate folder
        if (formFolder) {
          await supabase
            .from('documents')
            .update({
              parent_folder_id: formFolder.id,
              metadata: {
                autoCategorized: true,
                categorizedAt: new Date().toISOString(),
                clientName: analysis.clientName,
                formType: analysis.formType,
                formNumber: analysis.formNumber,
                estateNumber: analysis.estateNumber
              }
            })
            .eq('id', documentId);
        }
      }
    } catch (error) {
      console.error('Auto-categorization failed:', error);
    }
  }

  /**
   * Handle risk assessment and auto-task creation
   */
  private static async handleRiskAssessmentTasks(documentId: string, analysis: any) {
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

  /**
   * Get processing pipeline status
   */
  static async getPipelineStatus(documentId: string): Promise<DocumentProcessingPipeline | null> {
    try {
      const { data: document, error } = await supabase
        .from('documents')
        .select('metadata, ai_processing_status')
        .eq('id', documentId)
        .single();

      if (error || !document) return null;

      const metadata = document.metadata || {};
      
      return {
        documentId,
        stage: this.mapProcessingStage(document.ai_processing_status),
        progress: this.calculateProgress(document.ai_processing_status, metadata),
        errors: metadata.errors || [],
        metadata
      };
    } catch (error) {
      console.error('Failed to get pipeline status:', error);
      return null;
    }
  }

  private static mapProcessingStage(status: string): DocumentProcessingPipeline['stage'] {
    switch (status) {
      case 'pending': return 'upload';
      case 'processing': return 'ai_analysis';
      case 'complete': return 'complete';
      case 'failed': return 'complete';
      default: return 'upload';
    }
  }

  private static calculateProgress(status: string, metadata: any): number {
    switch (status) {
      case 'pending': return 20;
      case 'processing': return 60;
      case 'complete': return 100;
      case 'failed': return 100;
      default: return 0;
    }
  }
}
