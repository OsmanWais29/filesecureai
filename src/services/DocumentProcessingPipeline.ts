import { supabase } from '@/lib/supabase';
import { DeepSeekCoreService } from './DeepSeekCoreService';
import { toast } from 'sonner';

export interface DocumentProcessingPipeline {
  documentId: string;
  stage: 'upload' | 'storage' | 'ocr' | 'deepseek_analysis' | 'categorization' | 'risk_assessment' | 'complete' | 'duplicate_check' | 'ai_analysis';
  progress: number;
  errors: string[];
  metadata: Record<string, any>;
}

export class DocumentProcessingPipelineService {
  /**
   * Complete document processing pipeline with DeepSeek AI as the nucleus
   */
  static async processDocument(
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
      // Stage 1: Create document record and upload to storage
      pipeline.stage = 'upload';
      pipeline.progress = 10;
      
      const documentId = await this.createDocumentRecord(file, userId, options.clientHint);
      pipeline.documentId = documentId;

      // Stage 2: Store file in Supabase Storage
      pipeline.stage = 'storage';
      pipeline.progress = 25;
      
      const storagePath = await this.uploadToStorage(file, userId, documentId);
      
      // Stage 3: Extract text content (OCR if needed)
      pipeline.stage = 'ocr';
      pipeline.progress = 40;
      
      const documentText = await this.extractTextContent(file, storagePath);
      
      // Stage 4: DeepSeek AI Analysis (THE NUCLEUS)
      pipeline.stage = 'deepseek_analysis';
      pipeline.progress = 55;
      
      toast.info('DeepSeek AI Analysis Starting', {
        description: 'Advanced form recognition and risk assessment in progress'
      });

      // Store document text in metadata for DeepSeek analysis
      await supabase
        .from('documents')
        .update({
          storage_path: storagePath,
          metadata: {
            content: documentText,
            processing_stage: 'deepseek_analysis',
            deepseek_analysis_pending: true
          }
        })
        .eq('id', documentId);

      const analysisResult = await DeepSeekCoreService.analyzeDocument(documentId);
      
      if (!analysisResult) {
        pipeline.errors.push('DeepSeek AI analysis failed');
        return { success: false, pipeline };
      }

      pipeline.metadata.analysis = analysisResult;

      // Stage 5: Auto-Categorization Based on DeepSeek Results
      pipeline.stage = 'categorization';
      pipeline.progress = 75;

      await DeepSeekCoreService.triggerAutoCategorization(analysisResult);

      // Stage 6: Risk Assessment & Task Generation
      pipeline.stage = 'risk_assessment';
      pipeline.progress = 90;

      await DeepSeekCoreService.createTasksFromRisks(analysisResult);

      // Stage 7: Complete
      pipeline.stage = 'complete';
      pipeline.progress = 100;

      toast.success('Document processing complete', {
        description: `${analysisResult.formIdentification.formType} analyzed with ${analysisResult.formIdentification.confidence}% confidence`
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
   * Create document record with enhanced metadata - Made public
   */
  static async createDocumentRecord(
    file: File, 
    userId: string, 
    clientHint?: string
  ): Promise<string> {
    const timestamp = new Date().toISOString();
    const fileExt = file.name.split('.').pop();

    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        title: file.name,
        type: file.type,
        size: file.size,
        user_id: userId,
        ai_processing_status: 'pending',
        metadata: {
          original_name: file.name,
          uploaded_at: timestamp,
          file_extension: fileExt,
          client_hint: clientHint,
          processing_stage: 'created',
          deepseek_analysis_pending: true
        }
      })
      .select()
      .single();

    if (error || !document) {
      throw new Error(`Document record creation failed: ${error?.message}`);
    }

    return document.id;
  }

  /**
   * Upload file to Supabase Storage - Made public
   */
  static async uploadToStorage(
    file: File,
    userId: string,
    documentId: string
  ): Promise<string> {
    const timestamp = new Date().toISOString();
    const fileExt = file.name.split('.').pop();
    const storagePath = `${userId}/${timestamp.replace(/[:.]/g, '-')}_${documentId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file);

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    return storagePath;
  }

  /**
   * Extract text content from uploaded file - Made public
   */
  static async extractTextContent(file: File, storagePath: string): Promise<string> {
    // For now, return basic content - in production this would use OCR
    if (file.type === 'text/plain') {
      return await file.text();
    }
    
    // For PDF/images, we'll return the filename and metadata for DeepSeek to work with
    return `Document: ${file.name}\nType: ${file.type}\nSize: ${file.size} bytes\nStorage: ${storagePath}`;
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
      case 'processing': return 'deepseek_analysis';
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
