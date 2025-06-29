
export const detectPortalFromPath = () => {
  const currentPath = window.location.pathname;
  const isClient = currentPath.includes('/client-portal') || currentPath.includes('/client-login');
  const isTrustee = currentPath.includes('/trustee') || currentPath.includes('/login') || (!isClient && currentPath === '/');
  
  return {
    portal: isClient ? 'client' : 'trustee',
    isClient,
    isTrustee
  };
};

export const getLoginPath = (portal: 'client' | 'trustee') => {
  return portal === 'client' ? '/client-login' : '/login';
};

export const getDefaultPath = (portal: 'client' | 'trustee') => {
  return portal === 'client' ? '/client-portal' : '/trustee/dashboard';
};
