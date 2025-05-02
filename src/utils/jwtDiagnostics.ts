
// This file now serves as a barrel to re-export logic from focused modules

export * from "./jwtVerifier";             // JWT verification & re-authentication utilities
export * from "./storageDiagnostics";      // Storage permissions & upload diagnostics
export * from "./browserDiagnostics";      // Browser storage diagnostics
export * from "./jwtDiagnosticsTypes";     // Shared type definitions
export * from "./reliableUpload";
// Explicitly rename the import to avoid conflicts
export { 
  checkAndRefreshToken,
  fixAuthenticationIssues,
  startJwtMonitoring,
  stopJwtMonitoring,
  verifyJwtToken as monitoringVerifyJwt
} from "./jwtMonitoring";
