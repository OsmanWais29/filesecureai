
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
  } else if (pathname.startsWith('/trustee-portal') || pathname.startsWith('/trustee-login') || pathname === '/login') {
    portal = 'trustee';
  } else {
    // Default to trustee for main routes
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
    window.location.href = `/client-portal${path}`;
  } else {
    window.location.href = path === '/' ? '/crm' : path;
  }
};
