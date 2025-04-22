
/**
 * Shared types for JWT Diagnostics utilities.
 */

export interface JWTVerificationResult {
  isValid: boolean;
  reason?: string;
  timeRemaining?: number;
  expiresAt?: Date;
  currentTime?: Date;
  payload?: Record<string, any>;
  error?: any;
}

export interface DirectUploadResult {
  success: boolean;
  status?: number;
  data?: any;
  response?: Response;
  error?: any;
}

export interface StoragePermissionsResult {
  canListBuckets: boolean;
  buckets?: any[];
  canListFiles?: boolean;
  files?: any[];
  error?: any;
}

export interface BrowserStorageResult {
  localStorage?: {
    keys: string[];
    count: number;
  };
  sessionStorage?: {
    keys: string[];
    count: number;
  };
  error?: any;
}

export interface ReauthenticationResult {
  success: boolean;
  session?: any;
  error?: any;
}

export interface FullDiagnosticsResult {
  jwtVerification: JWTVerificationResult;
  storagePermissions: StoragePermissionsResult;
  browserStorage: BrowserStorageResult;
  directUpload?: DirectUploadResult;
  uploadTest?: {
    success: boolean;
    data?: any;
    error?: any;
  };
}

export interface FileUploadResult {
  success: boolean;
  method: string; // e.g., "standard", "refresh-and-retry", etc.
  data?: any;
  error?: any;
}
