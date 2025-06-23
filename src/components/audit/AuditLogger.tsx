
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Eye, 
  Edit, 
  Download, 
  Upload,
  MessageSquare,
  CheckSquare,
  User,
  Clock,
  Filter,
  Search,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  user_id: string;
  document_id?: string;
  action: string;
  metadata: Record<string, any>;
  timestamp: string;
  ip_address?: string;
  user_agent: string;
}

interface AuditLoggerProps {
  documentId?: string;
  showFilters?: boolean;
  maxEntries?: number;
}

export const AuditLogger: React.FC<AuditLoggerProps> = ({
  documentId,
  showFilters = false,
  maxEntries = 100
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const { role, isAdmin, isTrustee } = useUserRole();
  const { toast } = useToast();

  // Mock audit logs - in real app, this would come from Supabase
  const mockLogs: AuditLog[] = [
    {
      id: '1',
      user_id: 'admin-user-1',
      document_id: documentId || 'doc-123',
      action: 'view',
      metadata: {
        access_type: 'direct_link',
        duration: '00:05:32',
        pages_viewed: [1, 2, 3]
      },
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: '2',
      user_id: 'trustee-user-1',
      document_id: documentId || 'doc-123',
      action: 'edit',
      metadata: {
        field_changed: 'client_name',
        old_value: 'John Smith',
        new_value: 'John R. Smith'
      },
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    {
      id: '3',
      user_id: 'client-user-1',
      document_id: documentId || 'doc-123',
      action: 'comment',
      metadata: {
        comment_text: 'Please review section 3 for accuracy',
        thread_id: 'thread-456'
      },
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      ip_address: '10.0.0.50',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)'
    },
    {
      id: '4',
      user_id: 'trustee-user-2',
      document_id: documentId || 'doc-123',
      action: 'download',
      metadata: {
        file_format: 'pdf',
        download_reason: 'client_request'
      },
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, [documentId]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, actionFilter, timeFilter]);

  const filterLogs = () => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.metadata).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const timeLimit = {
        '1h': 1 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      }[timeFilter];

      if (timeLimit) {
        filtered = filtered.filter(log => 
          now.getTime() - new Date(log.timestamp).getTime() <= timeLimit
        );
      }
    }

    // Role-based filtering
    if (!isAdmin) {
      // Hide admin actions from non-admins
      filtered = filtered.filter(log => !log.user_id.includes('admin'));
      
      // Hide sensitive metadata for clients
      if (!isTrustee) {
        filtered = filtered.map(log => ({
          ...log,
          metadata: filterSensitiveMetadata(log.metadata),
          ip_address: undefined // Hide IP from clients
        }));
      }
    }

    setFilteredLogs(filtered.slice(0, maxEntries));
  };

  const filterSensitiveMetadata = (metadata: Record<string, any>) => {
    const filtered = { ...metadata };
    
    // Remove sensitive fields for clients
    delete filtered.internal_notes;
    delete filtered.admin_comments;
    delete filtered.system_settings;
    
    return filtered;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view': return <Eye className="h-4 w-4" />;
      case 'edit': return <Edit className="h-4 w-4" />;
      case 'download': return <Download className="h-4 w-4" />;
      case 'upload': return <Upload className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'task_change': return <CheckSquare className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'view': return 'default';
      case 'edit': return 'secondary';
      case 'download': return 'outline';
      case 'upload': return 'outline';
      case 'comment': return 'destructive';
      case 'task_change': return 'outline';
      default: return 'outline';
    }
  };

  const exportLogs = () => {
    if (!isAdmin && !isTrustee) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to export logs"
      });
      return;
    }

    const exportData = {
      document_id: documentId,
      exported_at: new Date().toISOString(),
      exported_by: 'current-user', // In real app, get from auth
      total_entries: filteredLogs.length,
      logs: filteredLogs
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${documentId || 'all'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `${filteredLogs.length} audit entries exported`
    });
  };

  const actionTypes = Array.from(new Set(logs.map(log => log.action)));

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading audit logs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Trail
            {documentId && <Badge variant="outline">Document: {documentId}</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-600" />
            {(isAdmin || isTrustee) && (
              <Button variant="outline" size="sm" onClick={exportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {showFilters && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actionTypes.map(action => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} entries
              {!isAdmin && (
                <span className="ml-2">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  Some entries may be filtered based on your access level
                </span>
              )}
            </div>
          </div>
        )}

        <ScrollArea className="h-[400px] w-full">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No audit logs found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={getActionColor(log.action) as any}
                        className="flex items-center gap-1"
                      >
                        {getActionIcon(log.action)}
                        {log.action}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        {log.user_id.substring(0, 12)}...
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                  
                  {Object.keys(log.metadata).length > 0 && (
                    <div className="text-xs bg-muted p-2 rounded">
                      <div className="font-medium mb-1">Details:</div>
                      {Object.entries(log.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {(isAdmin || isTrustee) && log.ip_address && (
                    <div className="text-xs text-muted-foreground">
                      IP: {log.ip_address}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
