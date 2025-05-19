
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

/**
 * Run comprehensive storage diagnostics
 * Tests browser storage capabilities and restrictions
 */
export const runStorageDiagnostics = async (): Promise<{
  localStorage: {
    available: boolean;
    writeable: boolean;
    error?: string;
  };
  cookies: {
    enabled: boolean;
    error?: string;
  };
  privateMode: {
    isPrivate: boolean;
    confidence: number;
  };
}> => {
  // Default result with conservative values
  const result = {
    localStorage: {
      available: false,
      writeable: false,
    },
    cookies: {
      enabled: false,
    },
    privateMode: {
      isPrivate: false,
      confidence: 0,
    }
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
      }
    }
  } catch (error) {
    result.localStorage.available = false;
    result.localStorage.error = error instanceof Error ? error.message : String(error);
  }
  
  // Test cookies
  try {
    const testCookie = `test_cookie_${Date.now()}`;
    document.cookie = `${testCookie}=1; path=/; max-age=60`;
    
    // Check if cookie was set
    result.cookies.enabled = document.cookie.includes(testCookie);
    
    // Clean up test cookie
    document.cookie = `${testCookie}=; path=/; max-age=0`;
  } catch (error) {
    result.cookies.enabled = false;
    result.cookies.error = error instanceof Error ? error.message : String(error);
  }
  
  // Check for private browsing mode
  // This is a best-effort detection, not 100% reliable
  try {
    // Test storage quota - private mode often has severe limitations
    const quota = (navigator as any)?.storage?.estimate ? 
      await (navigator as any).storage.estimate() : 
      undefined;
      
    // Common private browsing indicators
    const indicators = {
      limitedQuota: quota && quota.quota && quota.quota < 120000000, // Less than 120MB often indicates private mode
      noIndexedDB: !window.indexedDB,
      safariPrivateMode: !!window.safari && !!window.safari.pushNotification,
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
  } catch (error) {
    // If we can't detect, assume not private with low confidence
    result.privateMode = {
      isPrivate: false,
      confidence: 0
    };
  }
  
  return result;
};
