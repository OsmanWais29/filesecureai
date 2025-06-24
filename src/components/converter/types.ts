
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
  xml: string;
  json?: any;
  extractedData: {
    metadata: {
      filename: string;
      pageCount: number;
      processingTime: number;
      success: boolean;
    };
    sections: Array<{
      name: string;
      fields: Array<{
        name: string;
        value: string;
        confidence: number;
      }>;
    }>;
  };
  content: string;
  validationErrors: string[];
  validationWarnings: string[];
  error?: string;
}

export interface ProcessingStage {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: number;
  message?: string;
}

export interface ProcessingStatus {
  stage: ProcessingStage;
  progress: number;
  message: string;
  isComplete: boolean;
  hasError: boolean;
  overallProgress: number;
  currentStage: string;
  stages: ProcessingStage[];
  startTime: Date;
  estimatedTimeRemaining?: number;
  errors: string[];
  warnings: string[];
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
