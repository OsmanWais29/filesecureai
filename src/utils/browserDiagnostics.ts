
/**
 * Check browser storage for Supabase-related keys
 * Helps diagnose issues with authentication persistence
 */
export const getBrowserStorageInfo = (): {
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
} => {
  const result: any = {};
  
  try {
    // Check localStorage
    try {
      const localStorageKeys = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          localStorageKeys.push(key);
        }
      }
      
      result.localStorage = {
        count: localStorageKeys.length,
        keys: localStorageKeys
      };
    } catch (lsError) {
      result.localStorage = {
        count: 0,
        keys: [],
        error: lsError instanceof Error ? lsError.message : String(lsError)
      };
    }
    
    // Check sessionStorage
    try {
      const sessionStorageKeys = [];
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          sessionStorageKeys.push(key);
        }
      }
      
      result.sessionStorage = {
        count: sessionStorageKeys.length,
        keys: sessionStorageKeys
      };
    } catch (ssError) {
      result.sessionStorage = {
        count: 0,
        keys: [],
        error: ssError instanceof Error ? ssError.message : String(ssError)
      };
    }
    
    return result;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

interface StorageTestResult {
  available: boolean;
  writeable: boolean;
  error?: string;
}

interface CookieTestResult {
  enabled: boolean;
  error?: string;
}

/**
 * Run comprehensive storage diagnostics
 * Tests browser storage capabilities and restrictions
 */
export const runStorageDiagnostics = async (): Promise<{
  localStorage: StorageTestResult;
  cookies: CookieTestResult;
  privateMode: {
    isPrivate: boolean;
    confidence: number;
  };
  hasStorageIssue?: boolean;
  recommendations?: string[];
}> => {
  // Default result with conservative values
  const result = {
    localStorage: {
      available: false,
      writeable: false,
    } as StorageTestResult,
    cookies: {
      enabled: false,
    } as CookieTestResult,
    privateMode: {
      isPrivate: false,
      confidence: 0,
    },
    hasStorageIssue: false,
    recommendations: [] as string[]
  };
  
  // Test localStorage
  try {
    // Test availability
    if (typeof localStorage !== 'undefined') {
      result.localStorage.available = true;
      
      // Test if writeable
      const testKey = `test_${Date.now()}`;
      try {
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        result.localStorage.writeable = true;
      } catch (e) {
        result.localStorage.writeable = false;
        result.localStorage.error = e instanceof Error ? e.message : String(e);
        result.hasStorageIssue = true;
        result.recommendations.push('Enable localStorage in your browser settings');
      }
    }
  } catch (error) {
    result.localStorage.available = false;
    result.localStorage.error = error instanceof Error ? error.message : String(error);
    result.hasStorageIssue = true;
    result.recommendations.push('Check if your browser has localStorage disabled');
  }
  
  // Test cookies
  try {
    const testCookie = `test_cookie_${Date.now()}`;
    document.cookie = `${testCookie}=1; path=/; max-age=60`;
    
    // Check if cookie was set
    result.cookies.enabled = document.cookie.includes(testCookie);
    
    // Clean up test cookie
    document.cookie = `${testCookie}=; path=/; max-age=0`;
    
    if (!result.cookies.enabled) {
      result.hasStorageIssue = true;
      result.recommendations.push('Enable cookies in your browser settings');
    }
  } catch (error) {
    result.cookies.enabled = false;
    result.cookies.error = error instanceof Error ? error.message : String(error);
    result.hasStorageIssue = true;
    result.recommendations.push('Check if your browser has cookies disabled');
  }
  
  // Check for private browsing mode
  try {
    // Test storage quota - private mode often has severe limitations
    const quota = (navigator as any)?.storage?.estimate ? 
      await (navigator as any).storage.estimate() : 
      undefined;
      
    // Check for Safari's specific private mode detection
    const hasSafariPrivateMode = (window as any).safari && (window as any).safari.pushNotification;
      
    // Common private browsing indicators
    const indicators = {
      limitedQuota: quota && quota.quota && quota.quota < 120000000, // Less than 120MB often indicates private mode
      noIndexedDB: !window.indexedDB,
      safariPrivateMode: !!hasSafariPrivateMode,
      cookiesRestricted: !result.cookies.enabled,
      localStorageRestricted: !result.localStorage.writeable,
    };
    
    // Count positive indicators
    const positiveIndicators = Object.values(indicators).filter(Boolean).length;
    
    // Calculate confidence level (0-100%)
    const confidence = Math.min(positiveIndicators * 25, 100);
    
    result.privateMode = {
      isPrivate: confidence >= 50, // At least 2 indicators to consider it private
      confidence
    };
    
    if (result.privateMode.isPrivate && confidence >= 75) {
      result.hasStorageIssue = true;
      result.recommendations.push('Consider using regular browsing mode instead of private/incognito mode');
    }
  } catch (error) {
    // If we can't detect, assume not private with low confidence
    result.privateMode = {
      isPrivate: false,
      confidence: 0
    };
  }
  
  return result;
};
