
export interface PortalInfo {
  portal: 'client' | 'trustee' | null;
  isClient: boolean;
  isTrustee: boolean;
}

export const detectPortalFromPath = (): PortalInfo => {
  const pathname = window.location.pathname;
  
  let portal: 'client' | 'trustee' | null = null;
  
  if (pathname.startsWith('/client-portal') || pathname.startsWith('/client-login')) {
    portal = 'client';
  } else if (pathname.startsWith('/trustee') || pathname.startsWith('/trustee-login') || pathname === '/login') {
    portal = 'trustee';
  } else {
    // Default to trustee for main routes (legacy support)
    portal = 'trustee';
  }

  return {
    portal,
    isClient: portal === 'client',
    isTrustee: portal === 'trustee'
  };
};

export const redirectToPortal = (targetPortal: 'client' | 'trustee', path: string = '/') => {
  if (targetPortal === 'client') {
    window.location.href = `/client-portal${path === '/' ? '' : path}`;
  } else {
    window.location.href = `/trustee${path === '/' ? '' : path}`;
  }
};

export const getTrusteeRoute = (path: string): string => {
  return `/trustee${path}`;
};

export const getClientRoute = (path: string): string => {
  return `/client-portal${path}`;
};

export const isClientPortalRoute = (pathname: string): boolean => {
  return pathname.startsWith('/client-portal') || pathname.startsWith('/client-login');
};

export const isTrusteePortalRoute = (pathname: string): boolean => {
  return pathname.startsWith('/trustee') || pathname.startsWith('/trustee-login') || pathname === '/login';
};
