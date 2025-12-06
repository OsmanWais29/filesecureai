// Directive 32 Compliance Types

export type AuditEventType =
  | "upload"
  | "view"
  | "edit"
  | "move"
  | "delete"
  | "digitization"
  | "conversion"
  | "integrity_check"
  | "backup_event"
  | "access_event"
  | "qa_check"
  | "hash_change"
  | "corruption_detected"
  | "signature_validation";

export type EventOutcome = "success" | "warning" | "blocked" | "system_error";

export interface AuditLogEntry {
  id: string;
  timestampUtc: Date;
  timestampLocal: Date;
  user: string;
  userRole: string;
  isSystemAgent: boolean;
  eventType: AuditEventType;
  recordName: string;
  recordType: string;
  estateFile: string;
  actionDescription: string;
  outcome: EventOutcome;
  hashBefore?: string;
  hashAfter?: string;
  metadata?: MetadataSnapshot;
}

export interface MetadataSnapshot {
  documentId: string;
  hash: string;
  originalUploadTimestamp: Date;
  originalUploaderId: string;
  fileType: string;
  encoding: string;
  version: number;
  scannerModel?: string;
  dpi?: number;
  pdfaCompliant?: boolean;
  ocrEngineVersion?: string;
  osbMetadataFields?: Record<string, string>;
  previousHash?: string;
  newHash?: string;
  chainOfCustody: CustodyEvent[];
  accessControlList: AccessControlEntry[];
}

export interface CustodyEvent {
  timestamp: Date;
  action: string;
  user: string;
  details: string;
}

export interface AccessControlEntry {
  userId: string;
  userName: string;
  role: string;
  permissions: string[];
}

export interface ComplianceIndicator {
  id: string;
  title: string;
  status: "compliant" | "warning" | "non_compliant";
  checks: ComplianceCheck[];
}

export interface ComplianceCheck {
  label: string;
  passed: boolean;
  details?: string;
}

export interface DigitizationLog {
  id: string;
  timestamp: Date;
  eventType: "paper_to_digital" | "pdf_to_xml" | "quality_check";
  operator: string;
  scannerModel?: string;
  dpi?: number;
  ocrEngine?: string;
  dataLossCheck: boolean;
  xmlSchemaCompliant?: boolean;
  readabilityScore?: number;
  resolution?: string;
  textExtractionCompleteness?: number;
  outcome: EventOutcome;
  details: string;
}

export interface IntegrityLog {
  id: string;
  timestamp: Date;
  eventType: "hash_change" | "version_creation" | "unauthorized_attempt" | "corruption_detected" | "integrity_repair" | "signature_validation";
  hashBefore: string;
  hashAfter?: string;
  ruleTriggered: string;
  userResponsible: string;
  isSystemEvent: boolean;
  confidenceScore: number;
  reason: string;
  resolved: boolean;
}

export interface AccessLog {
  id: string;
  timestamp: Date;
  action: "viewed" | "downloaded" | "printed" | "exported";
  userId: string;
  userName: string;
  userRole: string;
  deviceFingerprint: string;
  ipAddress: string;
  documentId: string;
  documentName: string;
  exportFormat?: string;
  purpose?: string;
}

export interface QualityAssuranceLog {
  id: string;
  timestamp: Date;
  issueType: "failed_ocr" | "corrupted_file" | "missing_metadata" | "broken_linkage" | "invalid_xml" | "backup_failure" | "permission_inconsistency";
  severity: "critical" | "high" | "medium" | "low";
  detectedIssue: string;
  automatedFix?: string;
  approvedBy?: string;
  complianceNote?: string;
  resolvedAt?: Date;
  status: "open" | "in_progress" | "resolved";
}

export interface SystemStatus {
  backupStatus: {
    lastSuccessful: Date;
    offsiteValidated: boolean;
  };
  virusScanStatus: "passed" | "failed" | "running";
  serverUptime: string;
  mfaPolicyStatus: "enabled" | "disabled";
  permissionHealth: "healthy" | "issues_detected";
  encryptionStatus: "enabled" | "disabled";
  storageRedundancy: "replicated" | "single";
}

export type AuditTab = 
  | "all_activity"
  | "record_integrity"
  | "access_logs"
  | "conversion_logs"
  | "quality_assurance"
  | "exports";
