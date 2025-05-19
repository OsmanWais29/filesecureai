
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
