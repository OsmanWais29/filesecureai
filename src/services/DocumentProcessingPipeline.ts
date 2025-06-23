
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface DocumentProcessingPipeline {
  documentId: string;
  stage: 'upload' | 'duplicate_check' | 'ai_analysis' | 'categorization' | 'risk_assessment' | 'complete';
  progress: number;
  errors: string[];
  metadata: Record<string, any>;
}

export class DocumentProcessingPipelineService {
  /**
   * Create enhanced document record with metadata preparation
   */
  static async createDocumentRecord(
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
