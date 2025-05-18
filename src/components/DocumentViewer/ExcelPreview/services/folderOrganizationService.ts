
/**
 * Organizes folder structure for better visualization
 */
export const organizeFolder = (data: any[]) => {
  if (!data || !Array.isArray(data)) {
    console.error('Invalid folder data provided');
    return [];
  }

  // Sort folders first, then files alphabetically
  return [...data].sort((a, b) => {
    // Folders first
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    
    // Alphabetical sorting within same type
    return a.name.localeCompare(b.name);
  });
};

/**
 * Generates a breadcrumb path from the current folder path
 */
export const generateBreadcrumbs = (path: string) => {
  if (!path) return [];
  
  const parts = path.split('/').filter(p => p);
  const breadcrumbs = [];
  
  let currentPath = '';
  for (let i = 0; i < parts.length; i++) {
    currentPath += '/' + parts[i];
    breadcrumbs.push({
      name: parts[i],
      path: currentPath
    });
  }
  
  return breadcrumbs;
};

/**
 * Formats file size for display
 */
export const formatFileSize = (bytes: number) => {
  if (!bytes || isNaN(bytes)) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};
