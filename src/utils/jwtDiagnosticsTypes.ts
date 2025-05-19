
// Types related to JWT diagnostics and token management

/**
 * JWT verification result
 */
export interface JwtVerificationResult {
  isValid: boolean;
  timeRemaining?: number; // In seconds
  reason?: string;
}

/**
 * Storage permission check result
 */
export interface StoragePermissionCheck {
  bucket: string;
  canUpload: boolean;
  canDownload: boolean;
  error?: string;
}

/**
 * Test upload result
 */
export interface TestUploadResult {
  success: boolean;
  uploadSpeed?: number; // bytes per second
  error?: string;
  uploadId?: string;
}

/**
 * Direct upload test result
 */
export interface DirectUploadResult {
  success: boolean;
  data?: any;
  error?: any;
}

/**
 * Browser storage information
 */
export interface BrowserStorageInfo {
  localStorage?: {
    count: number;
    keys: string[];
    error?: string;
  };
  sessionStorage?: {
    count: number;
    keys: string[];
    error?: string;
  };
  error?: string;
}

/**
 * Full diagnostics result
 */
export interface FullDiagnosticsResult {
  jwtVerification: JwtVerificationResult;
  storagePermissions: {
    canListBuckets: boolean;
    buckets: string[];
    canListFiles: boolean;
    error?: string;
  };
  browserStorage: BrowserStorageInfo;
  directUpload?: {
    success: boolean;
    status?: number;
    response?: any;
    error?: string;
  };
  uploadTest?: TestUploadResult;
  recommendations: string[];
}
