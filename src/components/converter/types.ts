
export interface ProcessingOptions {
  useOcr: boolean;
  extractTables: boolean;
  detectSections: boolean;
  dateFormat: string;
  outputFormat: "xml" | "json";
  confidence: number;
}

export interface ConversionResult {
  success: boolean;
  outputFormat: string;
  extractedData: {
    title: string;
    pages: number;
    tables: number;
    sections: number;
  };
  content: string;
  error?: string;
}

export interface ProcessingStatus {
  stage: ProcessingStage;
  progress: number;
  message: string;
  isComplete: boolean;
  hasError: boolean;
}

export enum ProcessingStage {
  IDLE = 'idle',
  READING = 'reading',
  EXTRACTING = 'extracting',
  ANALYZING = 'analyzing',
  CONVERTING = 'converting',
  COMPLETE = 'complete',
  ERROR = 'error'
}
