
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Edit, 
  MessageSquare, 
  CheckSquare,
  Shield,
  Clock,
  User,
  Download,
  Eye,
  Lock
} from 'lucide-react';
import { AuditLogger } from './AuditLogger';
import { PermissionManager } from '../permissions/PermissionManager';
import { useUserRole } from '@/hooks/useUserRole';

interface DetailedAuditViewProps {
  documentId: string;
  documentTitle: string;
}

interface ChangeLog {
  id: string;
  timestamp: string;
  user_id: string;
  change_type: 'metadata' | 'field' | 'task' | 'comment';
  field_name?: string;
  old_value?: any;
  new_value?: any;
  description: string;
}

export const DetailedAuditView: React.FC<DetailedAuditViewProps> = ({
  documentId,
  documentTitle
}) => {
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const { role, isAdmin, isTrustee } = useUserRole();

  // Mock change logs data
  const mockChangeLogs: ChangeLog[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user_id: 'trustee-user-1',
      change_type: 'metadata',
      field_name: 'client_name',
      old_value: 'John Smith',
      new_value: 'John R. Smith',
      description: 'Updated client name with middle initial'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user_id: 'admin-user-1',
      change_type: 'field',
      field_name: 'surplus_income',
      old_value: '$2,500',
      new_value: '$2,750',
      description: 'Corrected surplus income calculation'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      user_id: 'trustee-user-1',
      change_type: 'task',
      description: 'Created task: Verify income documentation'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      user_id: 'client-user-1',
      change_type: 'comment',
      description: 'Added comment: Please review section 3'
    }
  ];

  useEffect(() => {
    setChangeLogs(mockChangeLogs);
  }, [documentId]);

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'metadata': return <FileText className="h-4 w-4" />;
      case 'field': return <Edit className="h-4 w-4" />;
      case 'task': return <CheckSquare className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'metadata': return 'default';
      case 'field': return 'secondary';
      case 'task': return 'outline';
      case 'comment': return 'destructive';
      default: return 'outline';
    }
  };

  const maskSensitiveChanges = (log: ChangeLog) => {
    // Role-based masking for change logs
    if (!isAdmin && !isTrustee) {
      // Hide internal changes from clients
      const restrictedFields = ['internal_notes', 'admin_comments', 'system_settings'];
      if (restrictedFields.includes(log.field_name || '')) {
        return null; // Hide completely
      }
      
      // Mask certain values
      if (log.field_name === 'trustee_notes') {
        return {
          ...log,
          old_value: '[RESTRICTED]',
          new_value: '[RESTRICTED]',
          description: 'Internal field updated'
        };
      }
    }
    return log;
  };

  const visibleChangeLogs = changeLogs
    .map(maskSensitiveChanges)
    .filter(log => log !== null) as ChangeLog[];

  const exportDetailedReport = () => {
    if (!isAdmin && !isTrustee) {
      return;
    }

    const report = {
      document: {
        id: documentId,
        title: documentTitle,
        exported_at: new Date().toISOString(),
        exported_by: 'current-user'
      },
      changes: visibleChangeLogs,
      metadata: {
        total_changes: visibleChangeLogs.length,
        date_range: {
          from: visibleChangeLogs[visibleChangeLogs.length - 1]?.timestamp,
          to: visibleChangeLogs[0]?.timestamp
        }
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detailed-audit-${documentId}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Detailed Audit: {documentTitle}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-600" title="Encrypted & Immutable" />
              {(isAdmin || isTrustee) && (
                <Button variant="outline" size="sm" onClick={exportDetailedReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="changes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="changes">Change History</TabsTrigger>
          <TabsTrigger value="access">Access Logs</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="changes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Document Changes
                <Badge variant="outline">{visibleChangeLogs.length} changes</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full">
                {visibleChangeLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <Edit className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No changes recorded</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visibleChangeLogs.map((log) => (
                      <div
                        key={log.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={getChangeTypeColor(log.change_type) as any}
                              className="flex items-center gap-1"
                            >
                              {getChangeTypeIcon(log.change_type)}
                              {log.change_type}
                            </Badge>
                            {log.field_name && (
                              <Badge variant="outline">{log.field_name}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            {log.user_id.substring(0, 8)}...
                            <Clock className="h-3 w-3" />
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                        
                        <p className="text-sm">{log.description}</p>
                        
                        {log.old_value && log.new_value && (
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="p-2 bg-red-50 border border-red-200 rounded">
                              <div className="font-medium text-red-800">Before:</div>
                              <div className="text-red-700">{log.old_value}</div>
                            </div>
                            <div className="p-2 bg-green-50 border border-green-200 rounded">
                              <div className="font-medium text-green-800">After:</div>
                              <div className="text-green-700">{log.new_value}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <AuditLogger documentId={documentId} showFilters={false} />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionManager 
            resourceType="document" 
            resourceId={documentId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
