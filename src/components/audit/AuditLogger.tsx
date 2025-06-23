
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Download, 
  Search, 
  Filter,
  Eye,
  Edit,
  Upload,
  MessageSquare,
  CheckSquare,
  Share,
  Trash,
  Clock,
  User,
  Lock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

interface AuditLog {
  id: string;
  action: string;
  user_id: string;
  document_id?: string;
  metadata: any;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

interface AuditLoggerProps {
  documentId?: string;
  userId?: string;
  showFilters?: boolean;
}

export const AuditLogger: React.FC<AuditLoggerProps> = ({ 
  documentId, 
  userId, 
  showFilters = true 
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const { toast } = useToast();
  const { role, isAdmin, isTrustee } = useUserRole();

  useEffect(() => {
    fetchAuditLogs();
  }, [documentId, userId]);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, actionFilter, dateFilter]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('document_access_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (documentId) {
        query = query.eq('document_id', documentId);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      // Role-based filtering
      if (!isAdmin && !isTrustee) {
        // Clients can only see their own logs
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.eq('user_id', user.id);
        }
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch audit logs"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(log => 
        new Date(log.created_at) >= startDate
      );
    }

    setFilteredLogs(filtered);
  };

  const exportLogs = async () => {
    try {
      // Role-based export permissions
      if (!isAdmin && !isTrustee) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to export audit logs"
        });
        return;
      }

      const csvContent = [
        ['Timestamp', 'Action', 'User ID', 'Document ID', 'IP Address', 'Details'].join(','),
        ...filteredLogs.map(log => [
          new Date(log.created_at).toISOString(),
          log.action,
          log.user_id,
          log.document_id || '',
          log.ip_address || '',
          JSON.stringify(log.metadata).replace(/"/g, '""')
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Audit logs exported successfully"
      });
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export audit logs"
      });
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view': return <Eye className="h-4 w-4" />;
      case 'edit': return <Edit className="h-4 w-4" />;
      case 'upload': return <Upload className="h-4 w-4" />;
      case 'download': return <Download className="h-4 w-4" />;
      case 'share': return <Share className="h-4 w-4" />;
      case 'delete': return <Trash className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'view': return 'default';
      case 'edit': return 'secondary';
      case 'upload': return 'default';
      case 'download': return 'outline';
      case 'share': return 'secondary';
      case 'delete': return 'destructive';
      default: return 'outline';
    }
  };

  const maskSensitiveData = (log: AuditLog) => {
    // Role-based data masking
    if (!isAdmin && !isTrustee) {
      // Hide sensitive metadata from clients
      const maskedMetadata = { ...log.metadata };
      delete maskedMetadata.internal_notes;
      delete maskedMetadata.admin_comments;
      delete maskedMetadata.system_details;
      
      return {
        ...log,
        metadata: maskedMetadata,
        ip_address: log.ip_address ? log.ip_address.replace(/\d+$/, 'xxx') : undefined
      };
    }
    return log;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Trail
            {filteredLogs.length > 0 && (
              <Badge variant="outline">{filteredLogs.length} entries</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportLogs}
              disabled={!isAdmin && !isTrustee}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAuditLogs}
            >
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      {showFilters && (
        <CardContent className="space-y-4 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="edit">Edit</SelectItem>
                <SelectItem value="upload">Upload</SelectItem>
                <SelectItem value="download">Download</SelectItem>
                <SelectItem value="share">Share</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      )}

      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading audit logs...</div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No audit logs found</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => {
                const maskedLog = maskSensitiveData(log);
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Badge variant={getActionColor(log.action) as any} className="flex items-center gap-1">
                        {getActionIcon(log.action)}
                        {log.action}
                      </Badge>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3 w-3" />
                          <span className="font-mono text-xs">
                            {log.user_id.substring(0, 8)}...
                          </span>
                          {maskedLog.ip_address && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {maskedLog.ip_address}
                              </span>
                            </>
                          )}
                        </div>
                        
                        {maskedLog.metadata && Object.keys(maskedLog.metadata).length > 0 && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {Object.entries(maskedLog.metadata).map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {typeof value === 'string' ? value : JSON.stringify(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                    
                    {(isAdmin || isTrustee) && (
                      <Lock className="h-4 w-4 text-green-600" title="Encrypted & Immutable" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
