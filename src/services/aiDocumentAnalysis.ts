
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface DocumentAnalysisResult {
  formType: string;
  formNumber: string;
  clientName: string;
  confidenceScore: number;
  extractedData: Record<string, any>;
  riskFlags: string[];
  suggestedCategory: string;
}

export interface FormReference {
  form_number: string;
  form_title: string;
  category: string;
  required_fields: string[];
  validation_rules: Record<string, any>;
  risk_indicators: string[];
}

export class AIDocumentAnalysisService {
  
  // Analyze document content using AI
  static async analyzeDocument(
    documentId: string, 
    documentContent: string,
    documentTitle: string
  ): Promise<DocumentAnalysisResult | null> {
    try {
      // Get BIA forms reference data
      const formReferences = await this.getBIAFormsReference();
      
      // Perform AI analysis (simulated for now - in production would use OpenAI/Claude)
      const analysisPrompt = `
        Analyze this document and extract key information:
        Title: ${documentTitle}
        Content: ${documentContent.substring(0, 2000)}...
        
        Available BIA Forms: ${formReferences.map(f => `${f.form_number}: ${f.form_title}`).join(', ')}
        
        Return JSON with: formType, formNumber, clientName, confidenceScore (0-1), extractedData, riskFlags, suggestedCategory
      `;

      // For Phase 2, we'll use intelligent pattern matching
      const result = await this.performIntelligentAnalysis(documentTitle, documentContent, formReferences);
      
      // Store analysis results
      await this.storeAnalysisResults(documentId, result);
      
      return result;
    } catch (error) {
      console.error('Document analysis failed:', error);
      toast.error('Document analysis failed');
      return null;
    }
  }

  // Get BIA forms reference data
  static async getBIAFormsReference(): Promise<FormReference[]> {
    try {
      const { data, error } = await supabase
        .from('bia_forms_reference')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch BIA forms reference:', error);
      return [];
    }
  }

  // Intelligent pattern-based analysis
  static async performIntelligentAnalysis(
    title: string,
    content: string,
    formReferences: FormReference[]
  ): Promise<DocumentAnalysisResult> {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    
    // Form detection patterns
    const formPatterns = {
      '47': ['form 47', 'consumer proposal', 'proposal', 'debt consolidation'],
      '76': ['form 76', 'statement of affairs', 'bankruptcy statement', 'asset liability'],
      '31': ['form 31', 'income expense', 'financial statement', 'monthly budget']
    };

    // Client name extraction patterns
    const clientNamePatterns = [
      /(?:debtor|client|applicant)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i,
      /name[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i,
      /^([A-Z][a-z]+ [A-Z][a-z]+)/m
    ];

    let detectedForm = 'unknown';
    let confidenceScore = 0.3;
    let clientName = 'Unknown Client';
    let extractedData: Record<string, any> = {};
    let riskFlags: string[] = [];

    // Detect form type
    for (const [formNum, patterns] of Object.entries(formPatterns)) {
      for (const pattern of patterns) {
        if (titleLower.includes(pattern) || contentLower.includes(pattern)) {
          detectedForm = formNum;
          confidenceScore = Math.max(confidenceScore, 0.8);
          break;
        }
      }
      if (detectedForm !== 'unknown') break;
    }

    // Extract client name
    for (const pattern of clientNamePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        clientName = match[1].trim();
        confidenceScore = Math.max(confidenceScore, 0.7);
        break;
      }
    }

    // Extract additional data based on form type
    if (detectedForm === '47') {
      extractedData = this.extractForm47Data(content);
      riskFlags = this.detectForm47Risks(content, extractedData);
    } else if (detectedForm === '76') {
      extractedData = this.extractForm76Data(content);
      riskFlags = this.detectForm76Risks(content, extractedData);
    } else if (detectedForm === '31') {
      extractedData = this.extractForm31Data(content);
      riskFlags = this.detectForm31Risks(content, extractedData);
    }

    const formRef = formReferences.find(f => f.form_number === detectedForm);
    const suggestedCategory = formRef?.category || 'general';

    return {
      formType: formRef?.form_title || 'Unknown Form',
      formNumber: detectedForm,
      clientName,
      confidenceScore,
      extractedData,
      riskFlags,
      suggestedCategory
    };
  }

  // Form-specific data extraction methods
  static extractForm47Data(content: string): Record<string, any> {
    const data: Record<string, any> = {};
    
    // Extract proposal terms
    const proposalMatch = content.match(/proposal[:\s]+([^\.]+)/i);
    if (proposalMatch) data.proposalTerms = proposalMatch[1].trim();
    
    // Extract payment amount
    const paymentMatch = content.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (paymentMatch) data.proposedPayment = paymentMatch[1];
    
    return data;
  }

  static extractForm76Data(content: string): Record<string, any> {
    const data: Record<string, any> = {};
    
    // Extract asset total
    const assetMatch = content.match(/total assets?[:\s]+\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i);
    if (assetMatch) data.totalAssets = assetMatch[1];
    
    // Extract liability total
    const liabilityMatch = content.match(/total liabilit(?:y|ies)[:\s]+\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i);
    if (liabilityMatch) data.totalLiabilities = liabilityMatch[1];
    
    return data;
  }

  static extractForm31Data(content: string): Record<string, any> {
    const data: Record<string, any> = {};
    
    // Extract monthly income
    const incomeMatch = content.match(/monthly income[:\s]+\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i);
    if (incomeMatch) data.monthlyIncome = incomeMatch[1];
    
    // Extract total expenses
    const expenseMatch = content.match(/total expenses?[:\s]+\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i);
    if (expenseMatch) data.totalExpenses = expenseMatch[1];
    
    return data;
  }

  // Risk detection methods
  static detectForm47Risks(content: string, data: Record<string, any>): string[] {
    const risks: string[] = [];
    
    if (!data.proposalTerms) risks.push('missing_proposal_terms');
    if (!data.proposedPayment) risks.push('missing_payment_amount');
    if (content.length < 500) risks.push('insufficient_detail');
    
    return risks;
  }

  static detectForm76Risks(content: string, data: Record<string, any>): string[] {
    const risks: string[] = [];
    
    if (!data.totalAssets) risks.push('missing_asset_total');
    if (!data.totalLiabilities) risks.push('missing_liability_total');
    
    // Check for asset/liability balance
    if (data.totalAssets && data.totalLiabilities) {
      const assets = parseFloat(data.totalAssets.replace(/,/g, ''));
      const liabilities = parseFloat(data.totalLiabilities.replace(/,/g, ''));
      if (assets > liabilities * 2) risks.push('asset_liability_imbalance');
    }
    
    return risks;
  }

  static detectForm31Risks(content: string, data: Record<string, any>): string[] {
    const risks: string[] = [];
    
    if (!data.monthlyIncome) risks.push('missing_income_data');
    if (!data.totalExpenses) risks.push('missing_expense_data');
    
    // Check income/expense balance
    if (data.monthlyIncome && data.totalExpenses) {
      const income = parseFloat(data.monthlyIncome.replace(/,/g, ''));
      const expenses = parseFloat(data.totalExpenses.replace(/,/g, ''));
      if (expenses > income * 1.2) risks.push('expenses_exceed_income');
    }
    
    return risks;
  }

  // Store analysis results in database
  static async storeAnalysisResults(documentId: string, result: DocumentAnalysisResult): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_document_analysis')
        .upsert({
          document_id: documentId,
          analysis_type: 'form_detection',
          confidence_score: result.confidenceScore,
          extracted_data: result.extractedData,
          identified_form_type: result.formType,
          client_name_extracted: result.clientName,
          form_number: result.formNumber,
          risk_flags: result.riskFlags,
          processing_status: 'completed'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to store analysis results:', error);
    }
  }

  // Get existing analysis for a document
  static async getDocumentAnalysis(documentId: string) {
    try {
      const { data, error } = await supabase
        .from('ai_document_analysis')
        .select('*')
        .eq('document_id', documentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Failed to get document analysis:', error);
      return null;
    }
  }
}
