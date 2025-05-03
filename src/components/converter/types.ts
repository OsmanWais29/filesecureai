
export interface ProcessingOption {
  id: string;
  label: string;
  description?: string;
  value: boolean | string | number;
  type: 'checkbox' | 'select' | 'text' | 'number';
  options?: { label: string; value: string | number }[];
}

export interface ProcessingOptions {
  useOcr: boolean;
  extractTables: boolean;
  detectSections: boolean;
  dateFormat: string;
  outputFormat: 'xml' | 'json';
  confidence: number;
}

export interface ProcessingStage {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: number;
  message?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface ProcessingStatus {
  overallProgress: number;
  currentStage: string;
  stages: ProcessingStage[];
  startTime: Date;
  estimatedTimeRemaining?: number;
  errors: string[];
  warnings: string[];
}

export interface ExtractedField {
  name: string;
  value: string | number;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
  };
}

export interface ExtractedSection {
  name: string;
  fields: ExtractedField[];
  tables?: ExtractedTable[];
}

export interface ExtractedTable {
  name: string;
  columns: string[];
  rows: any[][];
  pageNumbers: number[];
}

export interface ConversionResult {
  xml: string;
  json?: any;
  extractedData: {
    metadata: {
      filename: string;
      pageCount: number;
      processingTime: number;
      success: boolean;
    };
    sections: ExtractedSection[];
  };
  validationErrors: string[];
  validationWarnings: string[];
}
