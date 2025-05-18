
/**
 * Browser diagnostics utilities to check for potential storage issues
 * that could affect authentication and token management
 */

import { logAuthEvent, recordSessionEvent } from "./debugMode";

/**
 * Check if local storage is available and working
 * Many auth issues can be caused by disabled or malfunctioning storage
 */
export const checkLocalStorage = (): { available: boolean; error?: string } => {
  try {
    // Check if localStorage exists
    if (typeof localStorage === 'undefined') {
      return { available: false, error: "localStorage is not available in this browser" };
    }
    
    // Try to set and retrieve a value
    const testKey = '_storage_test_';
    const testValue = String(Date.now());
    
    localStorage.setItem(testKey, testValue);
    const retrievedValue = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    // Check if the value matches
    if (retrievedValue !== testValue) {
      return { available: false, error: "localStorage setItem/getItem test failed" };
    }
    
    return { available: true };
  } catch (error) {
    // localStorage can throw exceptions if disabled or in private browsing mode
    const errorMessage = error instanceof Error ? error.message : String(error);
    logAuthEvent(`LocalStorage check failed: ${errorMessage}`);
    return { available: false, error: errorMessage };
  }
};

/**
 * Check if cookies are enabled
 */
export const checkCookiesEnabled = (): { enabled: boolean; error?: string } => {
  try {
    // Check if cookies are enabled using navigator.cookieEnabled
    if (navigator && 'cookieEnabled' in navigator) {
      if (!navigator.cookieEnabled) {
        return { enabled: false, error: "Cookies are disabled in browser settings" };
      }
    }
    
    // Additional validation by attempting to set a cookie
    const testKey = '_cookie_test_';
    document.cookie = `${testKey}=1; SameSite=Strict; path=/`;
    const hasCookie = document.cookie.indexOf(testKey) !== -1;
    
    // Clean up
    document.cookie = `${testKey}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    
    if (!hasCookie) {
      return { enabled: false, error: "Unable to set test cookie" };
    }
    
    return { enabled: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logAuthEvent(`Cookie check failed: ${errorMessage}`);
    return { enabled: false, error: errorMessage };
  }
};

/**
 * Detect private browsing mode which can affect storage
 * Note: This is not 100% reliable but can help diagnose issues
 */
export const detectPrivateMode = async (): Promise<{ isPrivate: boolean; confidence: 'low' | 'medium' | 'high' }> => {
  try {
    // Try to write to localStorage (private mode in Safari often fails this)
    const localStorageTest = checkLocalStorage();
    if (!localStorageTest.available) {
      return { isPrivate: true, confidence: 'high' };
    }
    
    // Check if we have limited localStorage quota (often the case in private mode)
    try {
      const keyPrefix = '__private_mode_test__';
      let size = 0;
      let testValue = '';
      
      // Try to write 1MB
      while (testValue.length < 1024 * 1024) {
        testValue += new Array(1024).join('1');
        localStorage.setItem(`${keyPrefix}${size}`, testValue);
        size++;
        
        // Stop at 10MB to avoid freezing the browser
        if (size > 10) break;
      }
      
      // Clean up
      for (let i = 0; i < size; i++) {
        localStorage.removeItem(`${keyPrefix}${i}`);
      }
      
      // If we could write 5MB or more, likely not private mode
      if (size >= 5) {
        return { isPrivate: false, confidence: 'medium' };
      }
    } catch (e) {
      // QuotaExceededError often indicates private browsing
      const errorMessage = e instanceof Error ? e.message : String(e);
      if (errorMessage.includes('QuotaExceeded')) {
        return { isPrivate: true, confidence: 'high' };
      }
    }
    
    // If we get here, we're not certain
    return { isPrivate: false, confidence: 'low' };
  } catch (error) {
    logAuthEvent(`Private mode detection failed: ${error instanceof Error ? error.message : String(error)}`);
    return { isPrivate: false, confidence: 'low' };
  }
};

/**
 * Run all storage diagnostics and return a comprehensive report
 */
export const runStorageDiagnostics = async (): Promise<{
  localStorage: { available: boolean; error?: string };
  cookies: { enabled: boolean; error?: string };
  privateMode: { isPrivate: boolean; confidence: 'low' | 'medium' | 'high' };
  hasStorageIssue: boolean;
  recommendations: string[];
}> => {
  // Run all checks
  const localStorage = checkLocalStorage();
  const cookies = checkCookiesEnabled();
  const privateMode = await detectPrivateMode();
  
  // Determine if there's any storage issue
  const hasStorageIssue = !localStorage.available || !cookies.enabled || (privateMode.isPrivate && privateMode.confidence !== 'low');
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (!localStorage.available) {
    recommendations.push("Enable local storage in browser settings");
    recommendations.push("Try a different browser");
  }
  
  if (!cookies.enabled) {
    recommendations.push("Enable cookies for this site");
  }
  
  if (privateMode.isPrivate && privateMode.confidence !== 'low') {
    recommendations.push("Try using normal browsing mode instead of private/incognito");
  }
  
  if (hasStorageIssue) {
    recordSessionEvent('storage_issues_detected');
    logAuthEvent(`Storage issues detected: localStorage=${localStorage.available}, cookies=${cookies.enabled}, privateMode=${privateMode.isPrivate} (${privateMode.confidence} confidence)`);
  }
  
  return {
    localStorage,
    cookies,
    privateMode,
    hasStorageIssue,
    recommendations
  };
};
