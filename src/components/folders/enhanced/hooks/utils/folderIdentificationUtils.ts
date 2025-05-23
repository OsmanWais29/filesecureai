
import { Document } from '@/types/client';

export function identifyFolderType(folderName: string, documents?: Document[]): 'client' | 'estate' | 'form' | 'document' | 'folder' {
  const name = folderName.toLowerCase().trim();
  
  // Client patterns
  if (isClientFolder(name)) {
    return 'client';
  }
  
  // Estate patterns
  if (isEstateFolder(name)) {
    return 'estate';
  }
  
  // Form patterns
  if (isFormFolder(name)) {
    return 'form';
  }
  
  // Document patterns
  if (isDocumentFolder(name)) {
    return 'document';
  }
  
  return 'folder';
}

function isClientFolder(name: string): boolean {
  const clientPatterns = [
    /^client[_\s-]/i,
    /[_\s-]client$/i,
    /^[a-z]+,\s*[a-z]+$/i, // Last, First format
    /^[a-z]+\s+[a-z]+$/i,  // First Last format
    /debtor/i,
    /individual/i
  ];
  
  return clientPatterns.some(pattern => pattern.test(name));
}

function isEstateFolder(name: string): boolean {
  const estatePatterns = [
    /estate/i,
    /bankruptcy/i,
    /proposal/i,
    /case[_\s-]/i,
    /file[_\s-]/i,
    /matter/i
  ];
  
  return estatePatterns.some(pattern => pattern.test(name));
}

function isFormFolder(name: string): boolean {
  const formPatterns = [
    /form[_\s-]?\d+/i,
    /forms?$/i,
    /documents?$/i,
    /paperwork/i,
    /filing/i
  ];
  
  return formPatterns.some(pattern => pattern.test(name));
}

function isDocumentFolder(name: string): boolean {
  const documentPatterns = [
    /documents?/i,
    /files?/i,
    /attachments?/i,
    /uploads?/i
  ];
  
  return documentPatterns.some(pattern => pattern.test(name));
}

export function extractClientName(folderName: string): string {
  // Remove common prefixes/suffixes
  let cleanName = folderName
    .replace(/^(client[_\s-]?|debtor[_\s-]?)/i, '')
    .replace(/([_\s-]?(file|folder|docs?|documents?))?$/i, '')
    .trim();
  
  // Handle "Last, First" format
  if (cleanName.includes(',')) {
    const [last, first] = cleanName.split(',').map(s => s.trim());
    return `${first} ${last}`.trim();
  }
  
  return cleanName;
}

export function generateFolderSuggestions(documents: Document[]): string[] {
  const suggestions: string[] = [];
  
  // Analyze existing documents to suggest folder structure
  const clientNames = new Set<string>();
  const formTypes = new Set<string>();
  
  documents.forEach(doc => {
    // Extract client names from metadata
    if (doc.metadata?.client_name) {
      clientNames.add(doc.metadata.client_name);
    }
    
    // Extract form types
    if (doc.metadata?.form_type) {
      formTypes.add(doc.metadata.form_type);
    }
    
    // Analyze document titles for patterns
    const title = doc.title.toLowerCase();
    if (title.includes('form')) {
      const formMatch = title.match(/form[_\s-]?(\d+)/);
      if (formMatch) {
        formTypes.add(`Form ${formMatch[1]}`);
      }
    }
  });
  
  // Generate suggestions
  clientNames.forEach(name => {
    suggestions.push(`Client - ${name}`);
  });
  
  formTypes.forEach(type => {
    suggestions.push(`Forms - ${type}`);
  });
  
  // Add common folder suggestions
  suggestions.push(
    'Financial Documents',
    'Legal Documents',
    'Correspondence',
    'Court Filings',
    'Supporting Documents'
  );
  
  return suggestions.slice(0, 10); // Limit to top 10 suggestions
}

// Additional utility functions for folder recommendations
export function isDocumentForm47(document: Document, analysisData?: any): boolean {
  const title = document.title?.toLowerCase() || '';
  const metadata = document.metadata || {};
  const formType = metadata.form_type || '';
  
  return title.includes('form 47') || 
         title.includes('consumer proposal') ||
         formType.includes('form-47') ||
         formType.includes('consumer-proposal');
}

export function isDocumentForm76(document: Document, analysisData?: any): boolean {
  const title = document.title?.toLowerCase() || '';
  const metadata = document.metadata || {};
  const formType = metadata.form_type || '';
  
  return title.includes('form 76') || 
         title.includes('statement of affairs') ||
         formType.includes('form-76') ||
         formType.includes('statement-affairs');
}

export function isFinancialDocument(document: Document): boolean {
  const title = document.title?.toLowerCase() || '';
  const financialKeywords = [
    'financial', 'budget', 'income', 'expense', 'bank', 'statement',
    'receipt', 'invoice', 'tax', 'payroll', 'salary', 'wage'
  ];
  
  return financialKeywords.some(keyword => title.includes(keyword));
}

export function findAppropriateSubfolder(
  clientFolder: any, 
  isForm47: boolean, 
  isForm76: boolean, 
  isFinancial: boolean
): { targetFolderId: string; folderPath: string[]; suggestedSubfolderName?: string } {
  const basePath = [clientFolder.name];
  
  if (isForm47) {
    return {
      targetFolderId: clientFolder.id,
      folderPath: [...basePath, 'Forms', 'Form 47 - Consumer Proposal'],
      suggestedSubfolderName: 'Form 47 - Consumer Proposal'
    };
  }
  
  if (isForm76) {
    return {
      targetFolderId: clientFolder.id,
      folderPath: [...basePath, 'Forms', 'Form 76 - Statement of Affairs'],
      suggestedSubfolderName: 'Form 76 - Statement of Affairs'
    };
  }
  
  if (isFinancial) {
    return {
      targetFolderId: clientFolder.id,
      folderPath: [...basePath, 'Financial Documents'],
      suggestedSubfolderName: 'Financial Documents'
    };
  }
  
  return {
    targetFolderId: clientFolder.id,
    folderPath: basePath
  };
}

export function generateFolderRecommendations(document: Document, availableFolders: any[]): any {
  // Implementation for generating folder recommendations
  const clientName = extractClientName(document.title);
  
  return {
    documentId: document.id,
    documentTitle: document.title,
    suggestedFolderId: availableFolders[0]?.id || '',
    folderPath: [clientName || 'Unknown Client'],
    reason: 'Based on document content analysis'
  };
}
