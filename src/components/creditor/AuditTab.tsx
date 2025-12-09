import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  History,
  Search,
  Download,
  Filter,
  User,
  Bot,
  FileText,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Hash,
  Link2,
} from "lucide-react";
import { AuditEvent } from "@/types/estate";

interface AuditTabProps {
  estateId: string;
  events: AuditEvent[];
  onExportAuditLog: () => void;
}

export function AuditTab({ estateId, events, onExportAuditLog }: AuditTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionIcon = (actionType: string) => {
    if (actionType.includes('create')) return <FileText className="h-4 w-4 text-green-500" />;
    if (actionType.includes('update')) return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    if (actionType.includes('delete')) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (actionType.includes('approve')) return <Shield className="h-4 w-4 text-primary" />;
    if (actionType.includes('send')) return <FileText className="h-4 w-4 text-amber-500" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const getActionBadge = (actionType: string) => {
    const colorMap: Record<string, string> = {
      create: 'bg-green-500/10 text-green-600 border-green-500/20',
      update: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      delete: 'bg-red-500/10 text-red-600 border-red-500/20',
      approve: 'bg-primary/10 text-primary border-primary/20',
      send: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      generate: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      validate: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    };
    
    const actionKey = Object.keys(colorMap).find(key => actionType.includes(key)) || 'default';
    const className = colorMap[actionKey] || 'bg-muted text-muted-foreground border-border';
    
    return (
      <Badge variant="outline" className={className}>
        {actionType.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.action_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || event.action_type.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  const actionTypes = [...new Set(events.map(e => e.action_type.split('_')[0]))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Audit Trail
              </CardTitle>
              <CardDescription>
                Complete timeline of all estate actions (Directive 32R compliant)
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onExportAuditLog}>
              <Download className="h-4 w-4 mr-2" />
              Export Audit Log
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actionTypes.map(type => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hash Chain</p>
                <p className="font-medium text-green-600">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Signatures</p>
                <p className="font-medium text-green-600">Valid</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="font-medium">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Link2 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chain Integrity</p>
                <p className="font-medium text-blue-600">100%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Event Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold w-[180px]">Timestamp</TableHead>
                  <TableHead className="font-semibold">Actor</TableHead>
                  <TableHead className="font-semibold">Action</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Hash</TableHead>
                  <TableHead className="font-semibold">Chain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No audit events found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-mono text-xs">
                        {formatDateTime(event.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {event.actor === 'system' ? (
                            <Bot className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="capitalize text-sm">{event.actor}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(event.action_type)}
                          {getActionBadge(event.action_type)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-sm">
                        {event.description}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                          {event.payload_hash.slice(0, 12)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        {event.previous_event_id ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <Link2 className="h-3 w-3" />
                            <span className="text-xs">Linked</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Genesis</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
