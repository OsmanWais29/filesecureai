
/**
 * Robust subdomain detection that works in both development and production
 */

export interface SubdomainInfo {
  subdomain: string | null;
  isClient: boolean;
  isTrustee: boolean;
  isDevelopment: boolean;
}

/**
 * Detects the current subdomain with fallbacks for different environments
 */
export function detectSubdomain(): SubdomainInfo {
  const hostname = window.location.hostname;
  const isDevelopment = hostname === 'localhost' || hostname.includes('127.0.0.1');
  
  let subdomain: string | null = null;
  
  if (isDevelopment) {
    // Development: Check URL params first, then fallback to default
    const urlParams = new URLSearchParams(window.location.search);
    subdomain = urlParams.get('subdomain');
    
    // If no subdomain param, default to trustee for development
    if (!subdomain) {
      subdomain = 'trustee';
    }
  } else {
    // Production: Extract from hostname
    const hostParts = hostname.split('.');
    
    if (hostParts.length >= 3) {
      // Has subdomain: subdomain.domain.com
      subdomain = hostParts[0];
    } else if (hostParts.length === 2) {
      // No subdomain: domain.com - default to trustee
      subdomain = 'trustee';
    }
  }
  
  const isClient = subdomain === 'client';
  const isTrustee = !isClient; // Everything else is considered trustee
  
  return {
    subdomain,
    isClient,
    isTrustee,
    isDevelopment
  };
}

/**
 * Builds URLs for cross-subdomain navigation
 */
export function buildSubdomainUrl(targetSubdomain: string, path: string = ''): string {
  const { isDevelopment } = detectSubdomain();
  const currentOrigin = window.location.origin;
  
  if (isDevelopment) {
    // Development: Use URL params
    const baseUrl = currentOrigin.split('?')[0]; // Remove existing params
    return `${baseUrl}?subdomain=${targetSubdomain}${path ? `#${path}` : ''}`;
  } else {
    // Production: Use actual subdomains
    const hostname = window.location.hostname;
    const hostParts = hostname.split('.');
    
    if (hostParts.length >= 3) {
      // Replace existing subdomain
      hostParts[0] = targetSubdomain;
    } else {
      // Add subdomain
      hostParts.unshift(targetSubdomain);
    }
    
    const protocol = window.location.protocol;
    return `${protocol}//${hostParts.join('.')}${path}`;
  }
}

/**
 * Redirects to a different subdomain
 */
export function redirectToSubdomain(targetSubdomain: string, path: string = ''): void {
  const url = buildSubdomainUrl(targetSubdomain, path);
  window.location.href = url;
}
