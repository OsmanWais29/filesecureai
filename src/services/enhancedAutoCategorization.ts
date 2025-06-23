
import { supabase } from '@/lib/supabase';
import { DeepSeekDocumentAnalysisService } from './deepSeekDocumentAnalysis';
import { toast } from 'sonner';

export interface EnhancedCategorySuggestion {
  documentId: string;
  suggestedClientFolder: string;
  suggestedFormCategory: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  reasoning: string;
  formNumber: string;
  riskLevel: 'low' | 'medium' | 'high';
  complianceStatus: {
    biaCompliant: boolean;
    osbCompliant: boolean;
    issues: string[];
  };
}

export class EnhancedAutoCategorizationService {
  
  // Enhanced auto-categorization using DeepSeek analysis
  static async categorizeDocument(documentId: string): Promise<EnhancedCategorySuggestion | null> {
    try {
      toast.info('Analyzing document with DeepSeek AI...', { 
        description: 'Enhanced form recognition and risk assessment in progress' 
      });

      // Get enhanced DeepSeek analysis
      const analysis = await DeepSeekDocumentAnalysisService.analyzeDocument(documentId);
      
      if (!analysis) {
        throw new Error('DeepSeek analysis failed');
      }

      // Generate enhanced category suggestions
      const suggestion = this.generateEnhancedSuggestion(documentId, analysis);
      
      // Store categorization suggestion with enhanced data
      await this.storeEnhancedSuggestion(suggestion);
      
      toast.success('Document analyzed successfully', {
        description: `Form ${analysis.formNumber} detected with ${Math.round(analysis.confidenceScore * 100)}% confidence`
      });
      
      return suggestion;
    } catch (error) {
      console.error('Enhanced auto-categorization failed:', error);
      toast.error('Document categorization failed');
      return null;
    }
  }

  // Batch categorization for multiple documents
  static async batchCategorizeDocuments(documentIds: string[]): Promise<Record<string, EnhancedCategorySuggestion | null>> {
    try {
      toast.info(`Starting enhanced batch categorization...`, {
        description: `Processing ${documentIds.length} documents with DeepSeek AI`
      });

      // Get batch analysis from DeepSeek
      const analysisResults = await DeepSeekDocumentAnalysisService.batchAnalyzeDocuments(documentIds);
      
      const suggestions: Record<string, EnhancedCategorySuggestion | null> = {};
      
      // Generate suggestions for each successful analysis
      for (const [documentId, analysis] of Object.entries(analysisResults)) {
        if (analysis) {
          const suggestion = this.generateEnhancedSuggestion(documentId, analysis);
          await this.storeEnhancedSuggestion(suggestion);
          suggestions[documentId] = suggestion;
        } else {
          suggestions[documentId] = null;
        }
      }

      const successCount = Object.values(suggestions).filter(s => s !== null).length;
      toast.success(`Batch categorization completed`, {
        description: `Successfully categorized ${successCount} of ${documentIds.length} documents`
      });

      return suggestions;
    } catch (error) {
      console.error('Batch categorization failed:', error);
      toast.error('Batch categorization failed');
      throw error;
    }
  }

  // Generate enhanced suggestion from DeepSeek analysis
  private static generateEnhancedSuggestion(
    documentId: string, 
    analysis: any
  ): EnhancedCategorySuggestion {
    const confidenceLevel = this.determineEnhancedConfidenceLevel(analysis.confidenceScore);
    const riskLevel = this.determineRiskLevel(analysis.riskFlags, analysis.formValidation);
    const reasoning = this.generateEnhancedReasoning(analysis);

    return {
      documentId,
      suggestedClientFolder: analysis.clientName,
      suggestedFormCategory: analysis.suggestedCategory,
      confidenceLevel,
      reasoning,
      formNumber: analysis.formNumber,
      riskLevel,
      complianceStatus: {
        biaCompliant: analysis.formValidation.complianceIssues.length === 0,
        osbCompliant: !analysis.formValidation.complianceIssues.some(issue => 
          issue.toLowerCase().includes('osb')
        ),
        issues: analysis.formValidation.complianceIssues
      }
    };
  }

  // Enhanced confidence level determination
  private static determineEnhancedConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 0.85) return 'high';
    if (score >= 0.65) return 'medium';
    return 'low';
  }

  // Determine risk level from analysis
  private static determineRiskLevel(riskFlags: string[], formValidation: any): 'low' | 'medium' | 'high' {
    const criticalRisks = ['missing_signature', 'amount_discrepancy', 'incomplete_fields'];
    const hasCriticalRisk = riskFlags.some(flag => criticalRisks.includes(flag));
    
    if (hasCriticalRisk || !formValidation.isComplete) {
      return 'high';
    }
    
    if (riskFlags.length > 2 || formValidation.complianceIssues.length > 0) {
      return 'medium';
    }
    
    return 'low';
  }

  // Generate enhanced reasoning explanation
  private static generateEnhancedReasoning(analysis: any): string {
    const reasons = [];
    
    if (analysis.formNumber && analysis.formNumber !== 'unknown') {
      reasons.push(`DeepSeek identified BIA Form ${analysis.formNumber}`);
    }
    
    if (analysis.clientName && analysis.clientName !== 'Uncategorized Client') {
      reasons.push(`Client extracted: ${analysis.clientName}`);
    }
    
    const confidencePercent = Math.round(analysis.confidenceScore * 100);
    reasons.push(`AI confidence: ${confidencePercent}%`);
    
    if (analysis.riskFlags.length > 0) {
      reasons.push(`${analysis.riskFlags.length} potential issues detected`);
    }
    
    if (analysis.formValidation.isComplete) {
      reasons.push('Form validation passed');
    } else {
      reasons.push('Form validation flagged missing fields');
    }

    return reasons.join('. ') + '.';
  }

  // Store enhanced categorization suggestion
  private static async storeEnhancedSuggestion(suggestion: EnhancedCategorySuggestion): Promise<void> {
    try {
      const { error } = await supabase
        .from('document_categorization')
        .upsert({
          document_id: suggestion.documentId,
          suggested_client_folder: suggestion.suggestedClientFolder,
          suggested_form_category: suggestion.suggestedFormCategory,
          confidence_level: suggestion.confidenceLevel,
          categorization_reasoning: suggestion.reasoning,
          auto_applied: false,
          user_approved: null
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to store enhanced categorization suggestion:', error);
      throw error;
    }
  }

  // Apply enhanced categorization with risk assessment
  static async applyEnhancedCategorization(
    documentId: string, 
    userApproved: boolean = false,
    overrideRisk: boolean = false
  ): Promise<boolean> {
    try {
      // Get the suggestion
      const { data: categorization, error } = await supabase
        .from('document_categorization')
        .select('*')
        .eq('document_id', documentId)
        .single();

      if (error || !categorization) {
        throw new Error('No categorization found for document');
      }

      // Get the enhanced analysis for risk assessment
      const analysis = await DeepSeekDocumentAnalysisService.getDocumentAnalysis(documentId);
      
      // Check if high-risk documents should require manual approval
      if (analysis && !overrideRisk) {
        const riskFlags = analysis.risk_flags || [];
        const hasHighRisk = riskFlags.some((flag: string) => 
          ['missing_signature', 'amount_discrepancy', 'incomplete_fields'].includes(flag)
        );
        
        if (hasHighRisk && !userApproved) {
          toast.warning('High-risk document requires manual approval', {
            description: 'Please review the document before auto-categorization'
          });
          return false;
        }
      }

      // Create or find client folder
      const clientFolderId = await this.createOrFindClientFolder(categorization.suggested_client_folder);
      
      // Create or find form category folder under client
      const categoryFolderId = await this.createOrFindCategoryFolder(
        clientFolderId, 
        categorization.suggested_form_category
      );

      // Move document with enhanced metadata
      const { error: moveError } = await supabase
        .from('documents')
        .update({ 
          parent_folder_id: categoryFolderId,
          metadata: {
            auto_categorized: true,
            categorized_at: new Date().toISOString(),
            client_name: categorization.suggested_client_folder,
            form_category: categorization.suggested_form_category,
            deepseek_analysis: true,
            risk_assessment_completed: true,
            form_number: analysis?.form_number,
            confidence_score: analysis?.confidence_score
          }
        })
        .eq('id', documentId);

      if (moveError) throw moveError;

      // Update categorization record
      await supabase
        .from('document_categorization')
        .update({
          auto_applied: true,
          user_approved: userApproved
        })
        .eq('document_id', documentId);

      toast.success(
        `Document categorized under ${categorization.suggested_client_folder} > ${categorization.suggested_form_category}`,
        { description: 'Enhanced AI categorization applied successfully' }
      );
      
      return true;
    } catch (error) {
      console.error('Failed to apply enhanced categorization:', error);
      toast.error('Failed to categorize document');
      return false;
    }
  }

  // Create or find client folder (reuse existing logic)
  private static async createOrFindClientFolder(clientName: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: existingFolder } = await supabase
      .from('documents')
      .select('id')
      .eq('title', clientName)
      .eq('is_folder', true)
      .eq('folder_type', 'client')
      .eq('user_id', user.id)
      .single();

    if (existingFolder) {
      return existingFolder.id;
    }

    const { data: newFolder, error } = await supabase
      .from('documents')
      .insert({
        title: clientName,
        is_folder: true,
        folder_type: 'client',
        user_id: user.id,
        metadata: {
          created_by: 'enhanced_auto_categorization',
          client_name: clientName,
          deepseek_processed: true
        }
      })
      .select('id')
      .single();

    if (error) throw error;
    return newFolder.id;
  }

  // Create or find category folder under client (reuse existing logic)
  private static async createOrFindCategoryFolder(clientFolderId: string, categoryName: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: existingFolder } = await supabase
      .from('documents')
      .select('id')
      .eq('title', categoryName)
      .eq('is_folder', true)
      .eq('parent_folder_id', clientFolderId)
      .eq('user_id', user.id)
      .single();

    if (existingFolder) {
      return existingFolder.id;
    }

    const { data: newFolder, error } = await supabase
      .from('documents')
      .insert({
        title: categoryName,
        is_folder: true,
        folder_type: 'form',
        parent_folder_id: clientFolderId,
        user_id: user.id,
        metadata: {
          created_by: 'enhanced_auto_categorization',
          category_name: categoryName,
          deepseek_processed: true
        }
      })
      .select('id')
      .single();

    if (error) throw error;
    return newFolder.id;
  }
}
