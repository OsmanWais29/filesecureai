import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Eye,
  Upload,
  Download,
  Edit3,
  Trash2,
  FileText,
  RefreshCw,
  Database,
  Shield,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { AuditLogEntry, EventOutcome, AuditEventType } from "./types";
import { MetadataSnapshotDialog } from "./MetadataSnapshotDialog";

interface AuditLogTableProps {
  entries: AuditLogEntry[];
  onViewMetadata?: (entry: AuditLogEntry) => void;
}

const eventTypeIcons: Record<AuditEventType, typeof Upload> = {
  upload: Upload,
  view: Eye,
  edit: Edit3,
  move: RefreshCw,
  delete: Trash2,
  digitization: FileText,
  conversion: FileText,
  integrity_check: Shield,
  backup_event: Database,
  access_event: Eye,
  qa_check: RefreshCw,
  hash_change: Shield,
  corruption_detected: Trash2,
  signature_validation: Shield
};

const outcomeStyles: Record<EventOutcome, string> = {
  success: "bg-green-100 text-green-700 border-green-300",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-300",
  blocked: "bg-red-100 text-red-700 border-red-300",
  system_error: "bg-red-100 text-red-700 border-red-300"
};

const generateMockEntries = (): AuditLogEntry[] => [
  {
    id: "1",
    timestampUtc: new Date("2025-12-06T14:30:00Z"),
    timestampLocal: new Date("2025-12-06T09:30:00"),
    user: "J. Smith",
    userRole: "LIT",
    isSystemAgent: false,
    eventType: "upload",
    recordName: "Form 48 - Statement of Affairs",
    recordType: "PDF/A",
    estateFile: "234-1234",
    actionDescription: "Uploaded signed statement of affairs",
    outcome: "success",
    hashBefore: undefined,
    hashAfter: "sha256:a1b2c3d4e5f6..."
  },
  {
    id: "2",
    timestampUtc: new Date("2025-12-06T13:15:00Z"),
    timestampLocal: new Date("2025-12-06T08:15:00"),
    user: "System",
    userRole: "Automated",
    isSystemAgent: true,
    eventType: "integrity_check",
    recordName: "Trust Account Ledger",
    recordType: "XML",
    estateFile: "234-1234",
    actionDescription: "Daily integrity verification completed",
    outcome: "success",
    hashBefore: "sha256:x1y2z3...",
    hashAfter: "sha256:x1y2z3..."
  },
  {
    id: "3",
    timestampUtc: new Date("2025-12-06T11:45:00Z"),
    timestampLocal: new Date("2025-12-06T06:45:00"),
    user: "M. Johnson",
    userRole: "Case Admin",
    isSystemAgent: false,
    eventType: "conversion",
    recordName: "Creditor Claim Form",
    recordType: "PDF → XML",
    estateFile: "189-5678",
    actionDescription: "Converted creditor claim to OSB XML format",
    outcome: "success",
    hashBefore: "sha256:p1q2r3...",
    hashAfter: "sha256:s4t5u6..."
  },
  {
    id: "4",
    timestampUtc: new Date("2025-12-05T16:20:00Z"),
    timestampLocal: new Date("2025-12-05T11:20:00"),
    user: "A. Thompson",
    userRole: "Administrator",
    isSystemAgent: false,
    eventType: "view",
    recordName: "Monthly Distribution Report",
    recordType: "PDF/A",
    estateFile: "345-9012",
    actionDescription: "Reviewed distribution calculations",
    outcome: "success"
  },
  {
    id: "5",
    timestampUtc: new Date("2025-12-05T10:00:00Z"),
    timestampLocal: new Date("2025-12-05T05:00:00"),
    user: "System",
    userRole: "Automated",
    isSystemAgent: true,
    eventType: "backup_event",
    recordName: "Full Database Backup",
    recordType: "System",
    estateFile: "All",
    actionDescription: "Scheduled daily backup to offsite storage",
    outcome: "success"
  }
];

export const AuditLogTable = ({ 
  entries = generateMockEntries(),
  onViewMetadata 
}: AuditLogTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [showMetadataDialog, setShowMetadataDialog] = useState(false);

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.recordName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.estateFile.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEventType = eventTypeFilter === "all" || entry.eventType === eventTypeFilter;
    const matchesOutcome = outcomeFilter === "all" || entry.outcome === outcomeFilter;

    return matchesSearch && matchesEventType && matchesOutcome;
  });

  const handleViewMetadata = (entry: AuditLogEntry) => {
    setSelectedEntry(entry);
    setShowMetadataDialog(true);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records, users, estates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="upload">Upload</SelectItem>
            <SelectItem value="view">View</SelectItem>
            <SelectItem value="edit">Edit</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="conversion">Conversion</SelectItem>
            <SelectItem value="digitization">Digitization</SelectItem>
            <SelectItem value="integrity_check">Integrity Check</SelectItem>
            <SelectItem value="backup_event">Backup</SelectItem>
          </SelectContent>
        </Select>

        <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="system_error">Error</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-muted-foreground">
          {filteredEntries.length} entries
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[180px]">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Timestamp
                </div>
              </TableHead>
              <TableHead>User / Agent</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Record</TableHead>
              <TableHead>Estate</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead className="w-[120px]">Integrity Hash</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => {
              const EventIcon = eventTypeIcons[entry.eventType] || FileText;
              return (
                <TableRow key={entry.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">
                    <div>{format(entry.timestampUtc, "MMM dd, yyyy")}</div>
                    <div className="text-muted-foreground">
                      {format(entry.timestampUtc, "HH:mm:ss")} UTC
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        entry.isSystemAgent ? "bg-blue-500" : "bg-green-500"
                      )} />
                      <div>
                        <div className="font-medium text-sm">{entry.user}</div>
                        <div className="text-xs text-muted-foreground">{entry.userRole}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <EventIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize text-sm">{entry.eventType.replace(/_/g, " ")}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{entry.recordName}</div>
                    <div className="text-xs text-muted-foreground">{entry.recordType}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {entry.estateFile}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <span className="text-sm truncate block">{entry.actionDescription}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={outcomeStyles[entry.outcome]}>
                      {entry.outcome}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {entry.hashAfter ? (
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                        {entry.hashAfter.substring(0, 12)}...
                      </code>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleViewMetadata(entry)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <MetadataSnapshotDialog
        open={showMetadataDialog}
        onOpenChange={setShowMetadataDialog}
        entry={selectedEntry}
      />
    </div>
  );
};
