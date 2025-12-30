// Import Creditors Types

export type ImportSource = 
  | 'csv_excel'
  | 'osb_form_65'
  | 'osb_form_31'
  | 'pdf_documents'
  | 'system_copy'
  | 'manual_paste';

export interface ImportSourceOption {
  id: ImportSource;
  title: string;
  description: string;
  icon: string;
  acceptedFormats: string[];
}

export interface ImportedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  status: 'pending' | 'scanning' | 'scanned' | 'error';
  scanResult?: FileScanResult;
}

export interface FileScanResult {
  detectedType: string;
  documentIntent: 'schedule' | 'proof_of_claim' | 'statement' | 'form' | 'unknown';
  creditorCount: number;
  columns: string[];
  sampleData: Record<string, string>[];
  warnings: string[];
  aiInsights: string[];
}

export interface FieldMapping {
  sourceColumn: string;
  targetField: CreditorImportField | null;
  confidence: number;
  isRequired: boolean;
  sampleValues: string[];
}

export type CreditorImportField = 
  | 'name'
  | 'creditor_type'
  | 'account_number'
  | 'claim_amount'
  | 'priority'
  | 'security_indicator'
  | 'address'
  | 'city'
  | 'province'
  | 'postal_code'
  | 'country'
  | 'email'
  | 'phone'
  | 'contact_person'
  | 'notes';

export interface FieldMappingOption {
  field: CreditorImportField;
  label: string;
  required: boolean;
  description: string;
}

export interface DuplicateMatch {
  importedCreditor: ImportedCreditorRow;
  existingCreditor?: {
    id: string;
    name: string;
    account_number?: string;
  };
  matchType: 'exact' | 'fuzzy' | 'account_match' | 'name_similar';
  matchConfidence: number;
  resolution: 'merge' | 'skip' | 'create_new' | 'review_later' | null;
}

export interface ImportedCreditorRow {
  rowIndex: number;
  rawData: Record<string, string>;
  mappedData: Partial<MappedCreditorData>;
  aiClassification: AICreditorClassification;
  validation: RowValidation;
  duplicateMatch?: DuplicateMatch;
  linkedDocuments: string[];
}

export interface MappedCreditorData {
  name: string;
  creditor_type: string;
  account_number: string;
  claim_amount: number;
  priority: string;
  security_indicator: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  email: string;
  phone: string;
  contact_person: string;
  notes: string;
}

export interface AICreditorClassification {
  suggestedType: string;
  suggestedPriority: string;
  claimNature: string;
  isGovernment: boolean;
  governmentType?: 'cra' | 'service_canada' | 'province' | 'municipality';
  deemedTrustRisk: boolean;
  confidence: number;
  reasoning: string;
}

export interface RowValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  riskLevel: 'green' | 'yellow' | 'red';
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

export interface ImportSummary {
  totalCreditors: number;
  newCreditors: number;
  duplicatesResolved: number;
  duplicatesSkipped: number;
  duplicatesMerged: number;
  missingClaimAmounts: number;
  missingProofsOfClaim: number;
  priorityIssues: number;
  lateFilingRisks: number;
  governmentCreditors: number;
  greenCount: number;
  yellowCount: number;
  redCount: number;
}

export interface ImportWizardState {
  currentStep: number;
  importSource: ImportSource | null;
  estateId: string | null;
  files: ImportedFile[];
  fieldMappings: FieldMapping[];
  importedRows: ImportedCreditorRow[];
  summary: ImportSummary | null;
  isProcessing: boolean;
  error: string | null;
}

export const IMPORT_SOURCE_OPTIONS: ImportSourceOption[] = [
  {
    id: 'csv_excel',
    title: 'CSV / Excel',
    description: 'Import from schedules, internal lists, or spreadsheets',
    icon: 'FileSpreadsheet',
    acceptedFormats: ['.csv', '.xlsx', '.xls'],
  },
  {
    id: 'osb_form_65',
    title: 'OSB Form 65',
    description: 'Statement of Affairs - Extract creditor schedules',
    icon: 'FileText',
    acceptedFormats: ['.pdf'],
  },
  {
    id: 'osb_form_31',
    title: 'OSB Form 31 Batch',
    description: 'Proof of Claim batch exports',
    icon: 'Files',
    acceptedFormats: ['.pdf', '.csv'],
  },
  {
    id: 'pdf_documents',
    title: 'PDF Documents',
    description: 'Statements, Proofs of Claim, Schedules A/B',
    icon: 'FileText',
    acceptedFormats: ['.pdf'],
  },
  {
    id: 'system_copy',
    title: 'Copy from Estate',
    description: 'Import repeat creditors from another estate',
    icon: 'Copy',
    acceptedFormats: [],
  },
  {
    id: 'manual_paste',
    title: 'Manual Paste',
    description: 'Paste table data directly from Excel',
    icon: 'ClipboardPaste',
    acceptedFormats: [],
  },
];

export const FIELD_MAPPING_OPTIONS: FieldMappingOption[] = [
  { field: 'name', label: 'Creditor Name', required: true, description: 'Legal name of the creditor' },
  { field: 'creditor_type', label: 'Creditor Type', required: false, description: 'Type of creditor (bank, government, etc.)' },
  { field: 'account_number', label: 'Account / Reference #', required: false, description: 'Account or reference number' },
  { field: 'claim_amount', label: 'Claim Amount', required: false, description: 'Total claim amount' },
  { field: 'priority', label: 'Priority', required: false, description: 'Secured, preferred, or unsecured' },
  { field: 'security_indicator', label: 'Security Indicator', required: false, description: 'Indicates if claim is secured' },
  { field: 'address', label: 'Address', required: false, description: 'Street address' },
  { field: 'city', label: 'City', required: false, description: 'City name' },
  { field: 'province', label: 'Province', required: false, description: 'Province or state' },
  { field: 'postal_code', label: 'Postal Code', required: false, description: 'Postal or ZIP code' },
  { field: 'country', label: 'Country', required: false, description: 'Country name' },
  { field: 'email', label: 'Email', required: false, description: 'Email address' },
  { field: 'phone', label: 'Phone', required: false, description: 'Phone number' },
  { field: 'contact_person', label: 'Contact Person', required: false, description: 'Primary contact name' },
  { field: 'notes', label: 'Notes', required: false, description: 'Additional notes' },
];
