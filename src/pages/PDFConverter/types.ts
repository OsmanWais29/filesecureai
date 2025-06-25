
export interface ConversionHistory {
  id: string;
  fileName: string;
  clientName: string;
  documentType: string;
  date: string;
  status: 'completed' | 'pending' | 'error';
  confidence?: number;
  fieldsExtracted?: number;
}

export interface ExtractedField {
  name: string;
  value: string;
  confidence: 'high' | 'medium' | 'low';
  editable: boolean;
  aiSuggestion?: string;
  fieldType?: 'text' | 'number' | 'date' | 'currency';
  required?: boolean;
}

export interface ProcessingStatus {
  stage: string;
  progress: number;
  message: string;
  errors?: string[];
  warnings?: string[];
}

export interface AIPrompt {
  id: string;
  text: string;
  type: 'suggestion' | 'question' | 'action';
  category?: 'ocr' | 'validation' | 'compliance' | 'general';
}

export interface AIResponse {
  id: string;
  promptId: string;
  content: string;
  confidence: number;
  accepted?: boolean;
  timestamp: string;
}

export interface ExportOptions {
  format: 'xml' | 'json' | 'csv';
  includeMetadata: boolean;
  includeConfidence: boolean;
  includeOriginalFile: boolean;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  formType: string;
  fields: {
    name: string;
    required: boolean;
    type: string;
    validation?: string;
  }[];
}
