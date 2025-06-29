
export const detectPortalFromPath = () => {
  const currentPath = window.location.pathname;
  const isClient = currentPath.includes('/client') || currentPath.includes('/client-portal');
  const isTrustee = !isClient; // Default to trustee portal
  
  return {
    portal: isClient ? 'client' : 'trustee',
    isClient,
    isTrustee
  };
};
