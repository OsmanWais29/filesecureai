
import { supabase } from '@/lib/supabase';
import { AIDocumentAnalysisService } from './aiDocumentAnalysis';
import { toast } from 'sonner';

export interface CategorySuggestion {
  documentId: string;
  suggestedClientFolder: string;
  suggestedFormCategory: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  reasoning: string;
}

export class AutoCategorizationService {
  
  // Auto-categorize document based on AI analysis
  static async categorizeDocument(documentId: string): Promise<CategorySuggestion | null> {
    try {
      // Get document details
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (docError || !document) {
        throw new Error('Document not found');
      }

      // Get AI analysis results
      const analysis = await AIDocumentAnalysisService.getDocumentAnalysis(documentId);
      
      if (!analysis) {
        throw new Error('No AI analysis found for document');
      }

      // Generate category suggestions
      const suggestion = this.generateCategorySuggestion(document, analysis);
      
      // Store categorization suggestion
      await this.storeCategorySuggestion(suggestion);
      
      return suggestion;
    } catch (error) {
      console.error('Auto-categorization failed:', error);
      return null;
    }
  }

  // Generate intelligent category suggestions
  static generateCategorySuggestion(document: any, analysis: any): CategorySuggestion {
    const clientName = analysis.client_name_extracted || this.extractClientFromTitle(document.title);
    const formCategory = this.determineFormCategory(analysis);
    const confidenceLevel = this.determineConfidenceLevel(analysis);
    const reasoning = this.generateReasoning(analysis, clientName, formCategory);

    return {
      documentId: document.id,
      suggestedClientFolder: clientName,
      suggestedFormCategory: formCategory,
      confidenceLevel,
      reasoning
    };
  }

  // Extract client name from document title if not found in analysis
  static extractClientFromTitle(title: string): string {
    const patterns = [
      /^([A-Z][a-z]+ [A-Z][a-z]+)/,  // First Last at start
      /([A-Z][a-z]+ [A-Z][a-z]+) -/, // First Last before dash
      /client[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i // After "client:"
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return 'Uncategorized Client';
  }

  // Determine form category based on analysis
  static determineFormCategory(analysis: any): string {
    const formNumber = analysis.form_number;
    const formType = analysis.identified_form_type?.toLowerCase() || '';

    if (formNumber === '47' || formType.includes('consumer proposal')) {
      return 'Consumer Proposals';
    } else if (formNumber === '76' || formType.includes('statement of affairs')) {
      return 'Bankruptcy Documents';
    } else if (formNumber === '31' || formType.includes('income')) {
      return 'Financial Statements';
    } else if (formType.includes('form')) {
      return 'BIA Forms';
    } else {
      return 'General Documents';
    }
  }

  // Determine confidence level
  static determineConfidenceLevel(analysis: any): 'high' | 'medium' | 'low' {
    const score = analysis.confidence_score || 0;
    
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  }

  // Generate human-readable reasoning
  static generateReasoning(analysis: any, clientName: string, formCategory: string): string {
    const reasons = [];
    
    if (analysis.form_number && analysis.form_number !== 'unknown') {
      reasons.push(`Detected as BIA Form ${analysis.form_number}`);
    }
    
    if (analysis.client_name_extracted) {
      reasons.push(`Client name extracted: ${analysis.client_name_extracted}`);
    }
    
    if (analysis.confidence_score >= 0.8) {
      reasons.push('High confidence match');
    } else if (analysis.confidence_score >= 0.6) {
      reasons.push('Moderate confidence match');
    }
    
    if (analysis.risk_flags && analysis.risk_flags.length > 0) {
      reasons.push(`${analysis.risk_flags.length} potential issues identified`);
    }

    return reasons.length > 0 
      ? reasons.join('. ') + '.'
      : 'Categorized based on document content analysis.';
  }

  // Store categorization suggestion
  static async storeCategorySuggestion(suggestion: CategorySuggestion): Promise<void> {
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
      console.error('Failed to store category suggestion:', error);
      throw error;
    }
  }

  // Apply categorization automatically or with user approval
  static async applyCategorization(documentId: string, userApproved: boolean = false): Promise<boolean> {
    try {
      // Get categorization suggestion
      const { data: categorization, error } = await supabase
        .from('document_categorization')
        .select('*')
        .eq('document_id', documentId)
        .single();

      if (error || !categorization) {
        throw new Error('No categorization found for document');
      }

      // Create or find client folder
      const clientFolderId = await this.createOrFindClientFolder(categorization.suggested_client_folder);
      
      // Create or find form category folder under client
      const categoryFolderId = await this.createOrFindCategoryFolder(
        clientFolderId, 
        categorization.suggested_form_category
      );

      // Move document to the categorized folder
      const { error: moveError } = await supabase
        .from('documents')
        .update({ 
          parent_folder_id: categoryFolderId,
          metadata: {
            ...{}, // Keep existing metadata
            auto_categorized: true,
            categorized_at: new Date().toISOString(),
            client_name: categorization.suggested_client_folder,
            form_category: categorization.suggested_form_category
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

      toast.success(`Document categorized under ${categorization.suggested_client_folder} > ${categorization.suggested_form_category}`);
      return true;
    } catch (error) {
      console.error('Failed to apply categorization:', error);
      toast.error('Failed to categorize document');
      return false;
    }
  }

  // Create or find client folder
  static async createOrFindClientFolder(clientName: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Look for existing client folder
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

    // Create new client folder
    const { data: newFolder, error } = await supabase
      .from('documents')
      .insert({
        title: clientName,
        is_folder: true,
        folder_type: 'client',
        user_id: user.id,
        metadata: {
          created_by: 'auto_categorization',
          client_name: clientName
        }
      })
      .select('id')
      .single();

    if (error) throw error;
    return newFolder.id;
  }

  // Create or find category folder under client
  static async createOrFindCategoryFolder(clientFolderId: string, categoryName: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Look for existing category folder under client
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

    // Create new category folder
    const { data: newFolder, error } = await supabase
      .from('documents')
      .insert({
        title: categoryName,
        is_folder: true,
        folder_type: 'form',
        parent_folder_id: clientFolderId,
        user_id: user.id,
        metadata: {
          created_by: 'auto_categorization',
          category_name: categoryName
        }
      })
      .select('id')
      .single();

    if (error) throw error;
    return newFolder.id;
  }

  // Get categorization suggestion for a document
  static async getCategorySuggestion(documentId: string) {
    try {
      const { data, error } = await supabase
        .from('document_categorization')
        .select('*')
        .eq('document_id', documentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Failed to get category suggestion:', error);
      return null;
    }
  }
}
