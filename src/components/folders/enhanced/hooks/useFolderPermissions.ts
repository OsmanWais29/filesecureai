
import { useMemo } from 'react';
import { FolderPermissions } from '@/types/folders';
import { Document } from '@/types/client';

interface UseFolderPermissionsProps {
  folder?: Document;
  userRole?: string;
  userId?: string;
}

export function useFolderPermissions({ 
  folder, 
  userRole = 'user', 
  userId 
}: UseFolderPermissionsProps): FolderPermissions {
  return useMemo(() => {
    // Default permissions
    const defaultPermissions: FolderPermissions = {
      canView: true,
      canEdit: false,
      canDelete: false,
      canShare: false,
      canAddFiles: false
    };

    if (!folder) {
      return defaultPermissions;
    }

    // Check if folder is locked or system-protected
    const isLocked = folder.metadata?.locked === true;
    const isSystem = folder.metadata?.system === true;
    
    if (isSystem) {
      return {
        canView: true,
        canEdit: false,
        canDelete: false,
        canShare: false,
        canAddFiles: false
      };
    }

    // Admin has full permissions except on locked folders
    if (userRole === 'admin' || userRole === 'administrator') {
      return {
        canView: true,
        canEdit: !isLocked,
        canDelete: !isLocked,
        canShare: true,
        canAddFiles: !isLocked
      };
    }

    // Owner has full permissions except on locked folders
    if (folder.user_id === userId) {
      return {
        canView: true,
        canEdit: !isLocked,
        canDelete: !isLocked,
        canShare: true,
        canAddFiles: !isLocked
      };
    }

    // Check metadata permissions - ensure it's an object and has string keys
    const metadataPermissions = folder.metadata?.permissions;
    if (metadataPermissions && typeof metadataPermissions === 'object') {
      const userPermissions = metadataPermissions[String(userId)];
      if (userPermissions && typeof userPermissions === 'object') {
        return {
          canView: Boolean(userPermissions.canView ?? true),
          canEdit: Boolean(userPermissions.canEdit && !isLocked),
          canDelete: Boolean(userPermissions.canDelete && !isLocked),
          canShare: Boolean(userPermissions.canShare),
          canAddFiles: Boolean(userPermissions.canAddFiles && !isLocked)
        };
      }
    }

    // Trustee role permissions
    if (userRole === 'trustee') {
      return {
        canView: true,
        canEdit: !isLocked,
        canDelete: false,
        canShare: true,
        canAddFiles: !isLocked
      };
    }

    // Default read-only permissions
    return defaultPermissions;
  }, [folder, userRole, userId]);
}
