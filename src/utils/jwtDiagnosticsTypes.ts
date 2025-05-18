
/**
 * Types for JWT diagnostics
 */

export interface TokenDiagnostics {
  valid: boolean;
  expiresAt?: Date;
  expiresIn?: number; // seconds
  reasonInvalid?: string;
  tokenType?: string;
  clientVerified: boolean;
  serverVerified?: boolean;
  recommendations: string[];
}

export interface SessionDiagnostics {
  hasSession: boolean;
  hasCookies: boolean;
  hasLocalStorage: boolean;
  persistMode?: 'localStorage' | 'cookie' | 'memory' | 'unknown';
  authEventsWorking: boolean;
  recommendations: string[];
}

export interface AuthDiagnosticsReport {
  timestamp: number;
  sessionData: SessionDiagnostics;
  tokenData: TokenDiagnostics;
  hasPotentialIssues: boolean;
  recommendations: string[];
  userAgent: string;
  environment: 'development' | 'production' | 'unknown';
  version: string;
}

export type DiagnosticsCallback = (report: AuthDiagnosticsReport) => void;
