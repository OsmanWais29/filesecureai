
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface DeepSeekAnalysisResult {
  documentId: string;
  formIdentification: {
    formNumber: string;
    formType: string;
    confidence: number;
    category: string;
  };
  clientExtraction: {
    debtorName: string;
    estateNumber: string;
    trusteeName: string;
    courtDistrict: string;
    filingDate: string;
  };
  fieldExtraction: {
    requiredFields: Record<string, any>;
    optionalFields: Record<string, any>;
    missingFields: string[];
    completionPercentage: number;
  };
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high';
    riskFactors: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      recommendation: string;
      biaReference: string;
      fieldLocation: string;
      deadline?: string;
    }>;
    complianceStatus: {
      biaCompliant: boolean;
      osbCompliant: boolean;
      criticalIssues: string[];
      warningIssues: string[];
    };
  };
  metadata: {
    analysisConfidence: number;
    processingTime: string;
    requiresManualReview: boolean;
    suggestedActions: string[];
  };
  deepseekReasoning: string;
}

export class DeepSeekCoreService {
  /**
   * Core DeepSeek analysis - the nucleus of the AI system
   */
  static async analyzeDocument(documentId: string): Promise<DeepSeekAnalysisResult | null> {
    try {
      console.log('🧠 DeepSeek Core Analysis Starting:', documentId);
      
      // Get document details and content
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

      // Extract document text (from storage or metadata)
      let documentText = '';
      if (document.storage_path) {
        try {
          const { data: fileData } = await supabase.storage
            .from('documents')
            .download(document.storage_path);
          
          if (fileData) {
            documentText = await fileData.text();
          }
        } catch (storageError) {
          console.warn('Could not download from storage, checking metadata');
          documentText = document.metadata?.content || document.title || '';
        }
      } else {
        documentText = document.metadata?.content || document.title || '';
      }

      if (!documentText.trim()) {
        throw new Error('No document content available for analysis');
      }

      // Determine form hint from filename/title
      const formHint = this.extractFormHint(document.title);

      // Call enhanced DeepSeek analysis
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('deepseek-document-analysis', {
        body: {
          documentId,
          documentText,
          formHint,
          analysisType: 'comprehensive'
        }
      });

      if (analysisError) {
        throw new Error(`DeepSeek analysis failed: ${analysisError.message}`);
      }

      if (!analysisResult?.success) {
        throw new Error(analysisResult?.error || 'DeepSeek analysis failed');
      }

      const analysis = analysisResult.analysis as DeepSeekAnalysisResult;

      toast.success('DeepSeek AI analysis completed', {
        description: `Analyzed ${analysis.formIdentification.formType} with ${analysis.formIdentification.confidence}% confidence`
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
   * Extract form hint from document title for better DeepSeek analysis
   */
  private static extractFormHint(title: string): string {
    const lowerTitle = title.toLowerCase();
    
    // BIA Form patterns
    const formPatterns = [
      { pattern: /form\s*(\d+)/, hint: 'BIA Form' },
      { pattern: /consumer\s*proposal/, hint: 'Consumer Proposal Form 47' },
      { pattern: /assignment.*bankruptcy/, hint: 'Assignment in Bankruptcy Form 65' },
      { pattern: /proof.*claim/, hint: 'Proof of Claim Form 31' },
      { pattern: /statement.*affairs/, hint: 'Statement of Affairs Form 76' },
      { pattern: /income.*expense/, hint: 'Financial Statement' },
      { pattern: /trustee.*report/, hint: 'Trustee Report' }
    ];

    for (const { pattern, hint } of formPatterns) {
      if (pattern.test(lowerTitle)) {
        return hint;
      }
    }

    return 'Bankruptcy document';
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

  /**
   * Trigger auto-categorization based on DeepSeek results
   */
  static async triggerAutoCategorization(analysis: DeepSeekAnalysisResult): Promise<void> {
    if (!analysis.clientExtraction.debtorName || !analysis.formIdentification.formType) {
      return;
    }

    try {
      // Create client folder structure
      const { data: clientFolder, error: folderError } = await supabase
        .from('documents')
        .upsert({
          title: analysis.clientExtraction.debtorName,
          is_folder: true,
          folder_type: 'client',
          metadata: {
            client_name: analysis.clientExtraction.debtorName,
            estate_number: analysis.clientExtraction.estateNumber,
            auto_created: true,
            created_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (!folderError && clientFolder) {
        // Create form type subfolder
        const formFolderName = `${analysis.formIdentification.formNumber} - ${analysis.formIdentification.formType}`;
        const { data: formFolder } = await supabase
          .from('documents')
          .upsert({
            title: formFolderName,
            is_folder: true,
            folder_type: 'form',
            parent_folder_id: clientFolder.id,
            metadata: {
              form_number: analysis.formIdentification.formNumber,
              form_type: analysis.formIdentification.formType,
              auto_created: true
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
                auto_categorized: true,
                categorized_at: new Date().toISOString(),
                client_name: analysis.clientExtraction.debtorName,
                form_type: analysis.formIdentification.formType,
                form_number: analysis.formIdentification.formNumber,
                estate_number: analysis.clientExtraction.estateNumber
              }
            })
            .eq('id', analysis.documentId);
        }
      }
    } catch (error) {
      console.error('Auto-categorization failed:', error);
    }
  }

  /**
   * Create tasks from high-risk findings
   */
  static async createTasksFromRisks(analysis: DeepSeekAnalysisResult): Promise<void> {
    const highRiskFactors = analysis.riskAssessment.riskFactors.filter(
      risk => risk.severity === 'high'
    );

    for (const risk of highRiskFactors) {
      await supabase
        .from('tasks')
        .insert({
          title: `HIGH RISK: ${risk.type} - ${analysis.formIdentification.formType}`,
          description: `${risk.description}\n\nRecommended Action: ${risk.recommendation}\n\nBIA Reference: ${risk.biaReference}\n\nField Location: ${risk.fieldLocation}`,
          document_id: analysis.documentId,
          priority: 'high',
          status: 'pending',
          ai_generated: true,
          due_date: risk.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {
            risk_type: risk.type,
            severity: risk.severity,
            field_location: risk.fieldLocation,
            bia_reference: risk.biaReference,
            auto_created_by_deepseek: true,
            analysis_confidence: analysis.metadata.analysisConfidence
          }
        });
    }

    // Create notification for risk findings
    if (highRiskFactors.length > 0) {
      await supabase.functions.invoke('handle-notifications', {
        body: {
          action: 'create',
          notification: {
            title: 'High Risk Issues Detected',
            message: `${highRiskFactors.length} high-risk issues found in ${analysis.formIdentification.formType}`,
            type: 'warning',
            category: 'risk_assessment',
            priority: 'high',
            metadata: {
              documentId: analysis.documentId,
              riskCount: highRiskFactors.length,
              formType: analysis.formIdentification.formType
            }
          }
        }
      });
    }
  }
}
