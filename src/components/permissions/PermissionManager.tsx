
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Eye, 
  Edit, 
  Share, 
  Trash, 
  Users, 
  Lock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';

interface Permission {
  id: string;
  resource_type: 'document' | 'comment' | 'task';
  resource_id: string;
  user_id: string;
  role: string;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_share: boolean;
  created_at: string;
}

interface PermissionManagerProps {
  resourceType: 'document' | 'comment' | 'task';
  resourceId: string;
  onPermissionChange?: (permissions: Permission[]) => void;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  resourceType,
  resourceId,
  onPermissionChange
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const { role, isAdmin, isTrustee } = useUserRole();
  const { toast } = useToast();

  // Mock permissions data - in real app, this would come from Supabase
  const mockPermissions: Permission[] = [
    {
      id: '1',
      resource_type: resourceType,
      resource_id: resourceId,
      user_id: 'admin-user-1',
      role: 'admin',
      can_view: true,
      can_edit: true,
      can_delete: true,
      can_share: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      resource_type: resourceType,
      resource_id: resourceId,
      user_id: 'trustee-user-1',
      role: 'trustee',
      can_view: true,
      can_edit: true,
      can_delete: false,
      can_share: true,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      resource_type: resourceType,
      resource_id: resourceId,
      user_id: 'client-user-1',
      role: 'client',
      can_view: true,
      can_edit: false,
      can_delete: false,
      can_share: false,
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    setPermissions(mockPermissions);
    onPermissionChange?.(mockPermissions);
  }, [resourceType, resourceId]);

  const updatePermission = async (permissionId: string, field: string, value: boolean) => {
    if (!isAdmin && !isTrustee) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to modify permissions"
      });
      return;
    }

    try {
      const updatedPermissions = permissions.map(p => 
        p.id === permissionId ? { ...p, [field]: value } : p
      );
      
      setPermissions(updatedPermissions);
      onPermissionChange?.(updatedPermissions);
      
      toast({
        title: "Permission Updated",
        description: `${field} permission ${value ? 'granted' : 'revoked'}`
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update permission"
      });
    }
  };

  const getRoleColor = (userRole: string) => {
    switch (userRole) {
      case 'admin': return 'destructive';
      case 'trustee': return 'default';
      case 'client': return 'secondary';
      default: return 'outline';
    }
  };

  const getPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />;
  };

  // Role-based filtering
  const visiblePermissions = permissions.filter(permission => {
    if (isAdmin) return true; // Admins see all
    if (isTrustee) return permission.role !== 'admin'; // Trustees don't see admin permissions
    return permission.role === 'client'; // Clients only see client permissions
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Permissions - {resourceType}
          <Badge variant="outline">{visiblePermissions.length} users</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {visiblePermissions.map((permission) => (
            <div key={permission.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">
                    User {permission.user_id.substring(0, 8)}...
                  </span>
                  <Badge variant={getRoleColor(permission.role) as any}>
                    {permission.role}
                  </Badge>
                </div>
                
                {permission.role === 'client' && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">View</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPermissionIcon(permission.can_view)}
                    <Switch
                      checked={permission.can_view}
                      onCheckedChange={(checked) => 
                        updatePermission(permission.id, 'can_view', checked)
                      }
                      disabled={!isAdmin && !isTrustee}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    <span className="text-sm">Edit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPermissionIcon(permission.can_edit)}
                    <Switch
                      checked={permission.can_edit}
                      onCheckedChange={(checked) => 
                        updatePermission(permission.id, 'can_edit', checked)
                      }
                      disabled={!isAdmin && !isTrustee}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share className="h-4 w-4" />
                    <span className="text-sm">Share</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPermissionIcon(permission.can_share)}
                    <Switch
                      checked={permission.can_share}
                      onCheckedChange={(checked) => 
                        updatePermission(permission.id, 'can_share', checked)
                      }
                      disabled={!isAdmin && !isTrustee}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trash className="h-4 w-4" />
                    <span className="text-sm">Delete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPermissionIcon(permission.can_delete)}
                    <Switch
                      checked={permission.can_delete}
                      onCheckedChange={(checked) => 
                        updatePermission(permission.id, 'can_delete', checked)
                      }
                      disabled={!isAdmin && !isTrustee}
                    />
                  </div>
                </div>
              </div>
              
              {/* Role-based masking indicator */}
              {permission.role === 'client' && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  <Lock className="h-3 w-3 inline mr-1" />
                  Internal notes and admin comments are hidden from this user
                </div>
              )}
            </div>
          ))}
          
          {visiblePermissions.length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No permissions configured</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
