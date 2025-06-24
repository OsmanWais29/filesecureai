
import { supabase } from '@/lib/supabase';
import { DeepSeekCoreService } from './DeepSeekCoreService';
import { FileVersioningService } from './FileVersioningService';
import { DuplicatePreventionService } from './DuplicatePreventionService';
import { DocumentProcessingPipelineService, DocumentProcessingPipeline } from './DocumentProcessingPipeline';
import { AutoCategorizationService } from './AutoCategorizationService';
import { RiskAssessmentTaskService } from './RiskAssessmentTaskService';
import { DynamicFormTableService } from './DynamicFormTableService';
import { toast } from 'sonner';

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
      const documentId = await DocumentProcessingPipelineService.createDocumentRecord(file, userId, options.clientHint);
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

      // Stage 4: Dynamic Table Creation & Data Storage
      pipeline.stage = 'categorization';
      pipeline.progress = 55;

      // Generate and create dynamic table for this form type
      const tableSchema = await DynamicFormTableService.generateFormTableFromAnalysis(analysisResult);
      if (tableSchema) {
        const tableCreated = await DynamicFormTableService.createFormTable(tableSchema);
        if (tableCreated) {
          // Insert the extracted data into the form-specific table
          await DynamicFormTableService.insertFormData(
            analysisResult.formIdentification.formNumber,
            documentId,
            {
              client_name: analysisResult.clientExtraction.debtorName,
              estate_number: analysisResult.clientExtraction.estateNumber,
              ...analysisResult.fieldExtraction.requiredFields,
              ...analysisResult.fieldExtraction.optionalFields
            }
          );
        }
      }

      // Stage 5: Auto-Categorization Based on AI Results
      pipeline.progress = 70;
      await AutoCategorizationService.handleAutoCategorization(documentId, analysisResult);

      // Stage 6: Risk Assessment & Task Generation
      pipeline.stage = 'risk_assessment';
      pipeline.progress = 85;
      await RiskAssessmentTaskService.handleRiskAssessmentTasks(documentId, analysisResult);

      // Stage 7: Version Management
      pipeline.progress = 95;
      await FileVersioningService.createVersion(documentId, file, 'Initial upload with AI analysis');

      // Stage 8: Complete
      pipeline.stage = 'complete';
      pipeline.progress = 100;

      toast.success('Document processing complete', {
        description: `${analysisResult.formIdentification.formType} analyzed and stored in dynamic table`
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
   * Get processing pipeline status
   */
  static async getPipelineStatus(documentId: string): Promise<DocumentProcessingPipeline | null> {
    return DocumentProcessingPipelineService.getPipelineStatus(documentId);
  }

  /**
   * Get available dynamic tables created by AI
   */
  static async getAvailableDynamicTables() {
    return DynamicFormTableService.getAvailableTables();
  }

  /**
   * Manually trigger dynamic table creation for a specific form
   */
  static async createTableForForm(formNumber: string, formTitle: string, sampleAnalysis: any) {
    const schema = await DynamicFormTableService.generateFormTableFromAnalysis({
      formIdentification: { formNumber, formType: formTitle },
      fieldExtraction: sampleAnalysis.fieldExtraction || {},
      riskAssessment: sampleAnalysis.riskAssessment || {}
    });

    if (schema) {
      return DynamicFormTableService.createFormTable(schema);
    }
    return false;
  }
}
