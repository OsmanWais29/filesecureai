
/**
 * Production configuration and environment management
 */

interface ProductionConfig {
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    errorTracking: boolean;
    performanceMonitoring: boolean;
    securityEnhancement: boolean;
    caching: boolean;
    offlineSupport: boolean;
  };
  limits: {
    maxFileSize: number;
    maxConcurrentUploads: number;
    requestTimeout: number;
    cacheSize: number;
  };
  security: {
    csrfProtection: boolean;
    rateLimiting: boolean;
    sessionTimeout: number;
    maxFailedAttempts: number;
  };
}

const getEnvironment = (): 'development' | 'staging' | 'production' => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  } else if (hostname.includes('staging') || hostname.includes('dev')) {
    return 'staging';
  } else {
    return 'production';
  }
};

const environment = getEnvironment();

export const productionConfig: ProductionConfig = {
  apiUrl: environment === 'production' 
    ? 'https://api.securefiles.ai' 
    : 'http://localhost:3000',
  
  supabaseUrl: 'https://plxuyxacefgttimodrbp.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBseHV5eGFjZWZndHRpbW9kcmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4Mjk1NDksImV4cCI6MjA1NTQwNTU0OX0.2eRYQPoDgbl5Zqyya1YP9SBXlUOhZUP0ptWbGthT8sw',
  
  environment,
  
  features: {
    errorTracking: true,
    performanceMonitoring: environment !== 'development',
    securityEnhancement: environment === 'production',
    caching: true,
    offlineSupport: environment === 'production'
  },
  
  limits: {
    maxFileSize: environment === 'production' ? 50 * 1024 * 1024 : 100 * 1024 * 1024, // 50MB prod, 100MB dev
    maxConcurrentUploads: environment === 'production' ? 3 : 10,
    requestTimeout: environment === 'production' ? 30000 : 60000, // 30s prod, 60s dev
    cacheSize: environment === 'production' ? 100 : 50
  },
  
  security: {
    csrfProtection: environment === 'production',
    rateLimiting: environment !== 'development',
    sessionTimeout: environment === 'production' ? 30 * 60 * 1000 : 60 * 60 * 1000, // 30min prod, 60min dev
    maxFailedAttempts: environment === 'production' ? 3 : 10
  }
};

// Feature flags
export const isFeatureEnabled = (feature: keyof ProductionConfig['features']): boolean => {
  return productionConfig.features[feature];
};

// Environment checks
export const isProd = () => environment === 'production';
export const isDev = () => environment === 'development';
export const isStaging = () => environment === 'staging';

// Configuration getters
export const getApiUrl = () => productionConfig.apiUrl;
export const getFileUploadLimit = () => productionConfig.limits.maxFileSize;
export const getRequestTimeout = () => productionConfig.limits.requestTimeout;
export const getSessionTimeout = () => productionConfig.security.sessionTimeout;

// Debug configuration (only in development)
if (isDev()) {
  console.log('🔧 Production Config:', productionConfig);
}
