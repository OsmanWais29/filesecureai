/**
 * Production-grade error tracking and monitoring system
 */

interface ErrorContext {
  userId?: string;
  userRole?: string;
  route?: string;
  timestamp: string;
  userAgent?: string;
  sessionId?: string;
  component?: string;
  props?: Record<string, any>;
}

interface ErrorReport {
  id: string;
  error: Error;
  context: ErrorContext;
  stackTrace?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fingerprint: string;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private sessionId: string;
  private userId?: string;
  private userRole?: string;
  private errorQueue: ErrorReport[] = [];
  private isOnline = true;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
    this.setupNetworkStatusListeners();
    this.setupPeriodicReporting();
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.captureError(new Error(event.message), {
        component: 'Global',
        severity: 'high',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(new Error(event.reason), {
        component: 'Promise',
        severity: 'high',
        context: { reason: event.reason }
      });
    });
  }

  private setupNetworkStatusListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private setupPeriodicReporting(): void {
    setInterval(() => {
      if (this.isOnline && this.errorQueue.length > 0) {
        this.flushErrorQueue();
      }
    }, 30000); // Flush every 30 seconds
  }

  setUser(userId: string, role?: string): void {
    this.userId = userId;
    this.userRole = role;
  }

  captureError(error: Error, options: {
    component?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    context?: Record<string, any>;
    tags?: Record<string, string>;
  } = {}): void {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      error,
      context: {
        userId: this.userId,
        userRole: this.userRole,
        route: window.location.pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        component: options.component,
        props: options.context
      },
      stackTrace: error.stack,
      severity: options.severity || 'medium',
      fingerprint: this.generateFingerprint(error)
    };

    this.errorQueue.push(errorReport);

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.group(`🚨 Error Captured [${options.severity}]`);
      console.error('Error:', error);
      console.log('Context:', errorReport.context);
      console.log('Component:', options.component);
      console.groupEnd();
    }

    // Immediate reporting for critical errors
    if (options.severity === 'critical' && this.isOnline) {
      this.reportError(errorReport);
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFingerprint(error: Error): string {
    const message = error.message || 'Unknown error';
    const stack = error.stack || '';
    const hash = this.simpleHash(message + stack.split('\n')[0]);
    return hash.toString();
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await this.reportErrors(errors);
    } catch (error) {
      // Put errors back in queue if reporting fails
      this.errorQueue.unshift(...errors);
      console.warn('Failed to report errors, queued for retry');
    }
  }

  private async reportError(errorReport: ErrorReport): Promise<void> {
    return this.reportErrors([errorReport]);
  }

  private async reportErrors(errors: ErrorReport[]): Promise<void> {
    // This would integrate with your error reporting service
    // For now, we'll store in local storage and optionally send to your backend
    
    const errorData = {
      errors: errors.map(err => ({
        id: err.id,
        message: err.error.message,
        stack: err.stackTrace,
        context: err.context,
        severity: err.severity,
        fingerprint: err.fingerprint
      })),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };

    // Store locally for persistence
    this.storeErrorsLocally(errorData);

    // Send to backend if available
    try {
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      });

      if (!response.ok) {
        throw new Error('Failed to report errors to backend');
      }
    } catch (error) {
      console.warn('Backend error reporting failed, errors stored locally');
    }
  }

  private storeErrorsLocally(errorData: any): void {
    try {
      const stored = localStorage.getItem('error_reports') || '[]';
      const reports = JSON.parse(stored);
      reports.push(errorData);
      
      // Keep only last 50 error reports
      if (reports.length > 50) {
        reports.splice(0, reports.length - 50);
      }
      
      localStorage.setItem('error_reports', JSON.stringify(reports));
    } catch (error) {
      console.warn('Failed to store errors locally');
    }
  }

  getStoredErrors(): any[] {
    try {
      return JSON.parse(localStorage.getItem('error_reports') || '[]');
    } catch {
      return [];
    }
  }

  clearStoredErrors(): void {
    localStorage.removeItem('error_reports');
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();

// React hook for component error tracking
export const useErrorTracking = (componentName: string) => {
  const captureError = (error: Error, context?: Record<string, any>) => {
    errorTracker.captureError(error, {
      component: componentName,
      context,
      severity: 'medium'
    });
  };

  const captureCriticalError = (error: Error, context?: Record<string, any>) => {
    errorTracker.captureError(error, {
      component: componentName,
      context,
      severity: 'critical'
    });
  };

  return { captureError, captureCriticalError };
};
