
export interface SubdomainInfo {
  subdomain: string | null;
  isClient: boolean;
  isTrustee: boolean;
  isDevelopment: boolean;
}

export const detectSubdomain = (): SubdomainInfo => {
  const hostname = window.location.hostname;
  const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
  
  let subdomain: string | null = null;
  let isClient = false;
  let isTrustee = false;

  if (isDevelopment) {
    // For development, check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    subdomain = urlParams.get('subdomain');
    
    // Default to client subdomain in development if none specified
    if (!subdomain) {
      subdomain = 'client';
    }
    
    isClient = subdomain === 'client';
    isTrustee = subdomain === 'trustee';
  } else {
    // For production, parse subdomain from hostname
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      subdomain = parts[0];
      isClient = subdomain === 'client';
      isTrustee = subdomain === 'trustee';
    } else {
      // Default to trustee for main domain
      subdomain = 'trustee';
      isTrustee = true;
    }
  }

  return {
    subdomain,
    isClient,
    isTrustee,
    isDevelopment
  };
};

export const redirectToSubdomain = (targetSubdomain: 'client' | 'trustee', path: string = '/') => {
  const { isDevelopment } = detectSubdomain();
  
  if (isDevelopment) {
    // For development, use URL parameters
    const url = new URL(window.location.origin);
    url.searchParams.set('subdomain', targetSubdomain);
    url.pathname = path;
    window.location.href = url.toString();
  } else {
    // For production, redirect to subdomain
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    if (parts.length >= 2) {
      const domain = parts.slice(-2).join('.');
      window.location.href = `https://${targetSubdomain}.${domain}${path}`;
    }
  }
};
