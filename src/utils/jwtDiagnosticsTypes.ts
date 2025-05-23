
// JWT Diagnostics Types
export interface TestUploadResult {
  success: boolean;
  error?: string;
  details?: any;
}

export interface FileUploadResult {
  success: boolean;
  error?: string;
  details?: any;
  url?: string;
}

export interface JWTDiagnosticsResult {
  isValid: boolean;
  hasExpired: boolean;
  timeToExpiry?: number;
  claims?: any;
  error?: string;
}

export interface SessionDiagnosticsResult {
  hasSession: boolean;
  sessionValid: boolean;
  userAuthenticated: boolean;
  tokenPresent: boolean;
  error?: string;
}
