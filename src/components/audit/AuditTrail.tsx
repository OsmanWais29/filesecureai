
import React, { useState, useEffect } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye, Download, Edit, Trash2, Upload, Search, FileText, Calendar, User, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AuditLogEntry {
  id: string;
  action: string;
  user_id: string;
  document_id?: string;
  metadata: any;
  created_at: string;
  user_profile?: {
    full_name: string;
    email: string;
  };
  document?: {
    title: string;
  };
}

export const AuditTrail = () => {
  const { user } = useAuthState();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7'); // days
  const [selectedClient, setSelectedClient] = useState('all');

  useEffect(() => {
    if (user) {
      fetchAuditLogs();
    }
  }, [user, actionFilter, dateFilter]);

  const fetchAuditLogs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user_profile:profiles!audit_logs_user_id_fkey(full_name, email),
          document:documents(title)
        `);

      // Apply date filter
      if (dateFilter !== 'all') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(dateFilter));
        query = query.gte('created_at', daysAgo.toISOString());
      }

      // Apply action filter
      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLogs = async () => {
    try {
      const csvContent = generateCSV(auditLogs);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_trail_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      // Log the export action
      await supabase.from('audit_logs').insert({
        action: 'audit_export',
        user_id: user?.id,
        metadata: { 
          exported_records: auditLogs.length,
          export_date: new Date().toISOString()
        }
      });
      
      toast.success('Audit trail exported successfully');
    } catch (error) {
      console.error('Error exporting audit trail:', error);
      toast.error('Failed to export audit trail');
    }
  };

  const generateCSV = (logs: AuditLogEntry[]) => {
    const headers = ['Date/Time', 'User', 'Action', 'Document', 'IP Address', 'Details'];
    const rows = logs.map(log => [
      format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      log.user_profile?.full_name || 'Unknown User',
      log.action,
      log.document?.title || 'N/A',
      log.metadata?.ip_address || 'N/A',
      log.metadata?.details || ''
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view': return <Eye className="h-4 w-4" />;
      case 'download': return <Download className="h-4 w-4" />;
      case 'upload': return <Upload className="h-4 w-4" />;
      case 'edit': return <Edit className="h-4 w-4" />;
      case 'delete': return <Trash2 className="h-4 w-4" />;
      case 'login': return <User className="h-4 w-4" />;
      case 'logout': return <User className="h-4 w-4" />;
      case 'audit_export': return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'delete': return 'destructive';
      case 'edit': return 'default';
      case 'upload': return 'secondary';
      case 'view': case 'download': return 'outline';
      case 'login': case 'logout': return 'secondary';
      case 'audit_export': return 'default';
      default: return 'secondary';
    }
  };

  const getSeverityLevel = (action: string, metadata: any) => {
    if (action === 'delete' || metadata?.failed_login) return 'high';
    if (action === 'edit' || action === 'upload') return 'medium';
    return 'low';
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.user_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.document?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="h-20 bg-muted rounded"></CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Audit Trail
          </h1>
          <p className="text-muted-foreground">
            Comprehensive log of all system activities and security events
          </p>
        </div>
        <Button onClick={exportAuditLogs} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label htmlFor="search">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="action-filter">Action Type</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="download">Download</SelectItem>
                  <SelectItem value="upload">Upload</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="date-filter">Time Period</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 24 hours</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={fetchAuditLogs} variant="outline" className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No audit logs found</h3>
                <p className="text-muted-foreground">
                  No activities match your current filter criteria
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map((log) => {
            const severity = getSeverityLevel(log.action, log.metadata);
            
            return (
              <Card key={log.id} className={`${
                severity === 'high' ? 'border-l-4 border-l-destructive' :
                severity === 'medium' ? 'border-l-4 border-l-yellow-500' : ''
              }`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                          {severity === 'high' && (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              High Risk
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-sm">
                          {log.user_profile?.full_name || 'Unknown User'} 
                          {log.action === 'view' && ' viewed '}
                          {log.action === 'download' && ' downloaded '}
                          {log.action === 'upload' && ' uploaded '}
                          {log.action === 'edit' && ' edited '}
                          {log.action === 'delete' && ' deleted '}
                          {log.action === 'login' && ' logged in'}
                          {log.action === 'logout' && ' logged out'}
                          {log.document?.title && (
                            <span className="font-normal">"{log.document.title}"</span>
                          )}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                          </span>
                          {log.metadata?.ip_address && (
                            <span>IP: {log.metadata.ip_address}</span>
                          )}
                          {log.metadata?.user_agent && (
                            <span className="truncate max-w-48">
                              {log.metadata.user_agent}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
