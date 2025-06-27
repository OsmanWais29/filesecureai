/**
 * Production-grade security enhancements
 */

import { errorTracker } from './errorTracking';

interface SecurityConfig {
  maxRequestsPerMinute: number;
  sessionTimeoutMs: number;
  maxFailedAttempts: number;
  lockoutDurationMs: number;
}

class SecurityEnhancer {
  private static instance: SecurityEnhancer;
  private config: SecurityConfig;
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private failedAttempts = new Map<string, { count: number; lockedUntil: number }>();
  private csrfToken: string | null = null;

  private constructor(config: SecurityConfig = {
    maxRequestsPerMinute: 60,
    sessionTimeoutMs: 30 * 60 * 1000, // 30 minutes
    maxFailedAttempts: 5,
    lockoutDurationMs: 15 * 60 * 1000 // 15 minutes
  }) {
    this.config = config;
    this.setupSecurityHeaders();
    this.initializeCSRF();
    this.setupCleanupIntervals();
  }

  static getInstance(): SecurityEnhancer {
    if (!SecurityEnhancer.instance) {
      SecurityEnhancer.instance = new SecurityEnhancer();
    }
    return SecurityEnhancer.instance;
  }

  private setupSecurityHeaders(): void {
    // These would typically be set by your server/CDN
    if (typeof document !== 'undefined') {
      // Prevent clickjacking
      if (window.self !== window.top) {
        errorTracker.captureError(new Error('Potential clickjacking attempt'), {
          severity: 'high',
          component: 'SecurityEnhancer'
        });
      }
    }
  }

  private initializeCSRF(): void {
    this.csrfToken = this.generateSecureToken();
    
    // Store in meta tag for server-side verification
    if (typeof document !== 'undefined') {
      let metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.name = 'csrf-token';
        document.head.appendChild(metaTag);
      }
      metaTag.content = this.csrfToken;
    }
  }

  private setupCleanupIntervals(): void {
    // Clean up rate limiting data every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.requestCounts.entries()) {
        if (now > data.resetTime) {
          this.requestCounts.delete(key);
        }
      }
    }, 60000);

    // Clean up failed attempts data
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.failedAttempts.entries()) {
        if (now > data.lockedUntil) {
          this.failedAttempts.delete(key);
        }
      }
    }, 60000);
  }

  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private getClientIdentifier(): string {
    // In production, you might use IP address from server
    // For client-side, we'll use a session-based identifier
    let identifier = sessionStorage.getItem('security_identifier');
    if (!identifier) {
      identifier = this.generateSecureToken().substring(0, 16);
      sessionStorage.setItem('security_identifier', identifier);
    }
    return identifier;
  }

  // Rate limiting
  checkRateLimit(): boolean {
    const clientId = this.getClientIdentifier();
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window

    let requestData = this.requestCounts.get(clientId);
    if (!requestData || now > requestData.resetTime) {
      requestData = { count: 0, resetTime: now + 60000 };
      this.requestCounts.set(clientId, requestData);
    }

    requestData.count++;

    if (requestData.count > this.config.maxRequestsPerMinute) {
      errorTracker.captureError(new Error('Rate limit exceeded'), {
        severity: 'medium',
        component: 'SecurityEnhancer',
        context: { clientId, requestCount: requestData.count }
      });
      return false;
    }

    return true;
  }

  // Account lockout protection
  recordFailedAttempt(identifier: string): boolean {
    const now = Date.now();
    let attemptData = this.failedAttempts.get(identifier);

    if (!attemptData) {
      attemptData = { count: 0, lockedUntil: 0 };
      this.failedAttempts.set(identifier, attemptData);
    }

    // Check if account is currently locked
    if (now < attemptData.lockedUntil) {
      return false; // Account is locked
    }

    attemptData.count++;

    if (attemptData.count >= this.config.maxFailedAttempts) {
      attemptData.lockedUntil = now + this.config.lockoutDurationMs;
      
      errorTracker.captureError(new Error('Account locked due to failed attempts'), {
        severity: 'high',
        component: 'SecurityEnhancer',
        context: { identifier, failedAttempts: attemptData.count }
      });

      return false;
    }

    return true;
  }

  resetFailedAttempts(identifier: string): void {
    this.failedAttempts.delete(identifier);
  }

  isAccountLocked(identifier: string): boolean {
    const attemptData = this.failedAttempts.get(identifier);
    if (!attemptData) return false;

    return Date.now() < attemptData.lockedUntil;
  }

  // Input sanitization
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';

    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  sanitizeHtml(html: string): string {
    if (typeof html !== 'string') return '';

    // Basic HTML sanitization - in production use DOMPurify
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  // CSRF protection
  getCSRFToken(): string | null {
    return this.csrfToken;
  }

  validateCSRFToken(token: string): boolean {
    return token === this.csrfToken;
  }

  // Session security
  isSessionValid(): boolean {
    const sessionStart = sessionStorage.getItem('session_start');
    if (!sessionStart) return false;

    const sessionAge = Date.now() - parseInt(sessionStart);
    return sessionAge < this.config.sessionTimeoutMs;
  }

  refreshSession(): void {
    sessionStorage.setItem('session_start', Date.now().toString());
  }

  // Content Security Policy helpers
  generateNonce(): string {
    return this.generateSecureToken().substring(0, 16);
  }

  // Secure headers for API requests
  getSecureHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }

    return headers;
  }

  // Monitor suspicious activity
  detectSuspiciousActivity(activity: {
    type: string;
    details: Record<string, any>;
  }): void {
    const suspiciousPatterns = [
      'multiple_rapid_requests',
      'unusual_data_access',
      'privilege_escalation_attempt',
      'suspicious_file_upload'
    ];

    if (suspiciousPatterns.includes(activity.type)) {
      errorTracker.captureError(new Error(`Suspicious activity: ${activity.type}`), {
        severity: 'high',
        component: 'SecurityEnhancer',
        context: activity.details
      });
    }
  }

  // Audit logging
  logSecurityEvent(event: {
    type: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'data_access';
    userId?: string;
    details?: Record<string, any>;
  }): void {
    const securityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      clientId: this.getClientIdentifier(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store security events
    try {
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');
      events.push(securityEvent);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('security_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to log security event');
    }
  }

  getSecurityEvents(): any[] {
    try {
      return JSON.parse(localStorage.getItem('security_events') || '[]');
    } catch {
      return [];
    }
  }

  clearSecurityEvents(): void {
    localStorage.removeItem('security_events');
  }
}

// Export singleton instance
export const securityEnhancer = SecurityEnhancer.getInstance();

// React hook for security features
export const useSecurity = () => {
  const checkRateLimit = () => securityEnhancer.checkRateLimit();
  const sanitizeInput = (input: string) => securityEnhancer.sanitizeInput(input);
  const getCSRFToken = () => securityEnhancer.getCSRFToken();
  const logSecurityEvent = (event: Parameters<typeof securityEnhancer.logSecurityEvent>[0]) => 
    securityEnhancer.logSecurityEvent(event);

  return {
    checkRateLimit,
    sanitizeInput,
    getCSRFToken,
    logSecurityEvent,
    isSessionValid: () => securityEnhancer.isSessionValid(),
    refreshSession: () => securityEnhancer.refreshSession()
  };
};
