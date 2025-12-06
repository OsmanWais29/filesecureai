import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Download, 
  Printer, 
  FileOutput,
  Monitor,
  Globe
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { AccessLog } from "./types";

const mockAccessLogs: AccessLog[] = [
  {
    id: "1",
    timestamp: new Date("2025-12-06T15:30:00Z"),
    action: "viewed",
    userId: "USR-001",
    userName: "J. Smith",
    userRole: "LIT",
    deviceFingerprint: "Chrome/Windows",
    ipAddress: "192.168.1.100",
    documentId: "DOC-001",
    documentName: "Form 48 - Statement of Affairs",
  },
  {
    id: "2",
    timestamp: new Date("2025-12-06T14:15:00Z"),
    action: "downloaded",
    userId: "USR-002",
    userName: "M. Johnson",
    userRole: "Case Admin",
    deviceFingerprint: "Firefox/macOS",
    ipAddress: "192.168.1.101",
    documentId: "DOC-002",
    documentName: "Trust Account Reconciliation",
    exportFormat: "PDF/A"
  },
  {
    id: "3",
    timestamp: new Date("2025-12-06T11:45:00Z"),
    action: "printed",
    userId: "USR-001",
    userName: "J. Smith",
    userRole: "LIT",
    deviceFingerprint: "Chrome/Windows",
    ipAddress: "192.168.1.100",
    documentId: "DOC-003",
    documentName: "Monthly Distribution Report",
  },
  {
    id: "4",
    timestamp: new Date("2025-12-06T10:00:00Z"),
    action: "exported",
    userId: "USR-003",
    userName: "A. Thompson",
    userRole: "Administrator",
    deviceFingerprint: "Edge/Windows",
    ipAddress: "192.168.1.102",
    documentId: "DOC-004",
    documentName: "Creditor Claims Package",
    exportFormat: "XML",
    purpose: "OSB Submission"
  },
  {
    id: "5",
    timestamp: new Date("2025-12-05T16:20:00Z"),
    action: "viewed",
    userId: "USR-002",
    userName: "M. Johnson",
    userRole: "Case Admin",
    deviceFingerprint: "Safari/iOS",
    ipAddress: "10.0.0.50",
    documentId: "DOC-005",
    documentName: "Debtor Assessment Notes",
  }
];

const actionConfig = {
  viewed: { 
    icon: Eye, 
    label: "Viewed", 
    color: "bg-blue-100 text-blue-700 border-blue-300" 
  },
  downloaded: { 
    icon: Download, 
    label: "Downloaded", 
    color: "bg-purple-100 text-purple-700 border-purple-300" 
  },
  printed: { 
    icon: Printer, 
    label: "Printed", 
    color: "bg-orange-100 text-orange-700 border-orange-300" 
  },
  exported: { 
    icon: FileOutput, 
    label: "Exported", 
    color: "bg-green-100 text-green-700 border-green-300" 
  }
};

export const AccessLogsTable = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Access Logs</h2>
        </div>
        <Badge variant="outline" className="text-xs">
          {mockAccessLogs.length} events
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        Complete tracking of who viewed, downloaded, printed, or exported documents.
        Complies with Directive 32 requirements for origin, destination, and timestamps.
      </p>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Export Format</TableHead>
              <TableHead>Purpose</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAccessLogs.map((log) => {
              const config = actionConfig[log.action];
              const Icon = config.icon;
              
              return (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    <div>{format(log.timestamp, "MMM dd, yyyy")}</div>
                    <div className="text-muted-foreground">
                      {format(log.timestamp, "HH:mm:ss")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", config.color)}>
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{log.userName}</div>
                    <div className="text-xs text-muted-foreground">{log.userRole}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium max-w-[200px] truncate">
                      {log.documentName}
                    </div>
                    <code className="text-xs text-muted-foreground">{log.documentId}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs">{log.deviceFingerprint}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      <code className="text-xs font-mono">{log.ipAddress}</code>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.exportFormat ? (
                      <Badge variant="secondary" className="text-xs">
                        {log.exportFormat}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.purpose ? (
                      <span className="text-sm">{log.purpose}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
