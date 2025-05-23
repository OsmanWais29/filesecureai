
import { useState, useEffect } from 'react';
import { FolderStructure, UserRole, FolderPermissions } from '@/types/folders';

export const useFolderPermissions = (folder: FolderStructure, userRole: UserRole) => {
  const [permissions, setPermissions] = useState<FolderPermissions>({
    canRead: false,
    canWrite: false,
    canDelete: false,
    canShare: false
  });

  useEffect(() => {
    // Calculate permissions based on user role and folder type
    const calculatePermissions = (): FolderPermissions => {
      switch (userRole) {
        case 'admin':
        case 'administrator':
          return {
            canRead: true,
            canWrite: true,
            canDelete: true,
            canShare: true
          };
        case 'trustee':
        case 'manager':
          return {
            canRead: true,
            canWrite: true,
            canDelete: folder.type !== 'client',
            canShare: true
          };
        case 'user':
          return {
            canRead: true,
            canWrite: folder.type === 'document',
            canDelete: false,
            canShare: false
          };
        case 'client':
          return {
            canRead: folder.type === 'client',
            canWrite: false,
            canDelete: false,
            canShare: false
          };
        default:
          return {
            canRead: false,
            canWrite: false,
            canDelete: false,
            canShare: false
          };
      }
    };

    setPermissions(calculatePermissions());
  }, [folder, userRole]);

  return { permissions };
};
