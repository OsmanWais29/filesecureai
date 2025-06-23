
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Eye, 
  Edit, 
  Download, 
  User, 
  Clock, 
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string;
  document_id?: string;
  action: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent: string;
  created_at: string;
}

interface AuditLoggerProps {
  documentId?: string;
  showFilters?: boolean;
}

export const AuditLogger: React.FC<AuditLoggerProps> = ({
  documentId,
  showFilters = true
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  // Mock audit logs data
  const mockLogs: AuditLog[] = [
    {
      id: '1',
      user_id: 'trustee-user-1',
      document_id: documentId || 'doc-1',
      action: 'view',
      metadata: { access_type: 'direct_link' },
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0...',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      user_id: 'admin-user-1',
      document_id: documentId || 'doc-1',
      action: 'edit',
      metadata: { field_changed: 'client_name', old_value: 'John', new_value: 'John Smith' },
      ip_address: '192.168.1.2',
      user_agent: 'Mozilla/5.0...',
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: '3',
      user_id: 'trustee-user-2',
      document_id: documentId || 'doc-1',
      action: 'download',
      metadata: { format: 'pdf' },
      ip_address: '192.168.1.3',
      user_agent: 'Mozilla/5.0...',
      created_at: new Date(Date.now() - 10800000).toISOString()
    }
  ];

  useEffect(() => {
    setLogs(mockLogs);
  }, [documentId]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view': return <Eye className="h-4 w-4" />;
      case 'edit': return <Edit className="h-4 w-4" />;
      case 'download': return <Download className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'view': return 'default';
      case 'edit': return 'secondary';
      case 'download': return 'outline';
      default: return 'destructive';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Trail
            <Badge variant="outline">{filteredLogs.length} entries</Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLoading(true)}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {showFilters && (
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="edit">Edit</SelectItem>
                <SelectItem value="download">Download</SelectItem>
              </SelectContent>
            </Select>
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
                      <span className="text-sm text-muted-foreground">
                        by {log.user_id.substring(0, 8)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                  
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Details:</strong> {JSON.stringify(log.metadata, null, 2)}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {log.ip_address && (
                      <span>IP: {log.ip_address}</span>
                    )}
                    {log.document_id && (
                      <span>Document: {log.document_id.substring(0, 8)}...</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
