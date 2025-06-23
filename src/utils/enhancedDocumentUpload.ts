
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { EnhancedDocumentAnalysis } from '@/services/EnhancedDocumentAnalysis';

interface EnhancedUploadOptions {
  onProgress?: (progress: number) => void;
  clientName?: string;
  enableEnhancedAnalysis?: boolean;
  formTypeHint?: string;
}

export const uploadDocumentWithEnhancedAnalysis = async (
  file: File,
  options: EnhancedUploadOptions = {}
): Promise<{ success: boolean; documentId?: string; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    options.onProgress?.(10);
    toast.info('Uploading document...', { 
      description: 'File upload in progress' 
    });

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    options.onProgress?.(40);

    // Determine if document should trigger enhanced analysis
    const shouldAnalyze = shouldTriggerEnhancedAnalysis(file.name, file.type, options.formTypeHint);

    // Create document record in database
    const { data: documentData, error: docError } = await supabase
      .from('documents')
      .insert({
        title: file.name,
        storage_path: filePath,
        type: file.type,
        size: file.size,
        user_id: user.id,
        ai_processing_status: shouldAnalyze ? 'pending' : 'complete',
        is_folder: false,
        metadata: {
          originalName: file.name,
          clientName: options.clientName,
          uploadedAt: new Date().toISOString(),
          enhancedAnalysisEnabled: shouldAnalyze,
          formTypeHint: options.formTypeHint
        }
      })
      .select()
      .single();

    if (docError) {
      console.error('Document record error:', docError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('documents').remove([filePath]);
      throw docError;
    }

    if (!documentData?.id) {
      throw new Error('Failed to create document record');
    }

    options.onProgress?.(70);

    // Trigger enhanced analysis if applicable
    if (shouldAnalyze && options.enableEnhancedAnalysis !== false) {
      toast.info('Starting enhanced BIA analysis...', { 
        description: 'DeepSeek AI will analyze the document for compliance and risks' 
      });

      // Start enhanced analysis in background
      setTimeout(async () => {
        try {
          await EnhancedDocumentAnalysis.analyzeDocument(String(documentData.id), {
            includeRiskAssessment: true,
            includeComplianceCheck: true,
            generateTasks: true,
            customPrompt: options.formTypeHint ? `This appears to be a ${options.formTypeHint}. Please focus analysis on relevant compliance requirements.` : undefined
          });
        } catch (analysisError) {
          console.error('Enhanced analysis failed:', analysisError);
          toast.error('Document uploaded but enhanced analysis failed', {
            description: 'You can manually trigger analysis from the document viewer'
          });
        }
      }, 1000);
    }

    options.onProgress?.(100);

    // Create notification for successful upload
    try {
      await supabase.functions.invoke('handle-notifications', {
        body: {
          action: 'create',
          userId: user.id,
          notification: {
            title: 'Document Uploaded',
            message: `"${file.name}" has been uploaded successfully`,
            type: 'success',
            category: 'file_activity',
            priority: 'normal',
            action_url: `/document/${documentData.id}`,
            metadata: {
              documentId: documentData.id,
              fileName: file.name,
              uploadedAt: new Date().toISOString(),
              hasEnhancedAnalysis: shouldAnalyze
            }
          }
        }
      });
    } catch (notificationError) {
      console.warn('Failed to create notification:', notificationError);
    }

    toast.success('Document uploaded successfully', {
      description: shouldAnalyze ? 'Enhanced analysis started automatically' : 'Ready for viewing'
    });

    return {
      success: true,
      documentId: String(documentData.id)
    };

  } catch (error) {
    console.error('Enhanced document upload failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    
    toast.error('Document upload failed', {
      description: errorMessage
    });

    return {
      success: false,
      error: errorMessage
    };
  }
};

// Enhanced analysis trigger logic for BIA forms
const shouldTriggerEnhancedAnalysis = (fileName: string, fileType?: string, formHint?: string): boolean => {
  const lowerName = fileName.toLowerCase();
  
  // BIA form patterns (Forms 1-96)
  const biaFormPatterns = [
    'form', 'proposal', 'statement', 'bankruptcy', 'consumer',
    'assignment', 'proof', 'claim', 'creditor', 'debtor', 'trustee',
    'notice', 'certificate', 'dividend', 'receipt', 'security',
    'appointment', 'affairs', 'income', 'expense', 'financial',
    'assets', 'liabilities', 'bia', 'osb'
  ];
  
  // Form number detection (Form 1-96)
  const formNumberPattern = /form\s*\d{1,2}\b/i;
  const biaSectionPattern = /bia\s*\d+/i;
  
  // Check file type compatibility
  const supportedTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  const hasValidType = !fileType || supportedTypes.some(type => 
    fileType.toLowerCase().includes(type)
  );
  
  // Form type hint provided
  if (formHint) {
    return hasValidType;
  }
  
  // Pattern matching
  const matchesPattern = biaFormPatterns.some(pattern => lowerName.includes(pattern)) ||
                        formNumberPattern.test(lowerName) ||
                        biaSectionPattern.test(lowerName);
  
  return hasValidType && matchesPattern;
};

export const getDocumentUrl = (storagePath: string): string => {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(storagePath);
    
  return data.publicUrl;
};
