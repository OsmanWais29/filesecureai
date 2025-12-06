import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Hash,
  FileWarning,
  Lock
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { IntegrityLog } from "./types";

const mockIntegrityLogs: IntegrityLog[] = [
  {
    id: "1",
    timestamp: new Date("2025-12-06T14:00:00Z"),
    eventType: "signature_validation",
    hashBefore: "sha256:a1b2c3...",
    hashAfter: "sha256:a1b2c3...",
    ruleTriggered: "Cryptographic Signature Check",
    userResponsible: "System",
    isSystemEvent: true,
    confidenceScore: 100,
    reason: "Automated daily signature validation",
    resolved: true
  },
  {
    id: "2",
    timestamp: new Date("2025-12-06T10:30:00Z"),
    eventType: "hash_change",
    hashBefore: "sha256:x1y2z3...",
    hashAfter: "sha256:p4q5r6...",
    ruleTriggered: "Document Modification Detection",
    userResponsible: "J. Smith",
    isSystemEvent: false,
    confidenceScore: 95,
    reason: "Authorized document update with version control",
    resolved: true
  },
  {
    id: "3",
    timestamp: new Date("2025-12-05T16:45:00Z"),
    eventType: "unauthorized_attempt",
    hashBefore: "sha256:m1n2o3...",
    ruleTriggered: "Unauthorized Access Prevention",
    userResponsible: "Unknown",
    isSystemEvent: false,
    confidenceScore: 98,
    reason: "Blocked attempt to modify locked document",
    resolved: true
  },
  {
    id: "4",
    timestamp: new Date("2025-12-05T09:00:00Z"),
    eventType: "version_creation",
    hashBefore: "sha256:d4e5f6...",
    hashAfter: "sha256:g7h8i9...",
    ruleTriggered: "Version Control System",
    userResponsible: "M. Johnson",
    isSystemEvent: false,
    confidenceScore: 100,
    reason: "New version created after creditor update",
    resolved: true
  },
  {
    id: "5",
    timestamp: new Date("2025-12-04T11:20:00Z"),
    eventType: "integrity_repair",
    hashBefore: "sha256:corrupted",
    hashAfter: "sha256:j1k2l3...",
    ruleTriggered: "Automatic Corruption Recovery",
    userResponsible: "System",
    isSystemEvent: true,
    confidenceScore: 92,
    reason: "Restored from backup after metadata corruption detected",
    resolved: true
  }
];

const eventTypeConfig = {
  hash_change: { 
    icon: Hash, 
    label: "Hash Change", 
    color: "bg-blue-100 text-blue-700 border-blue-300" 
  },
  version_creation: { 
    icon: FileWarning, 
    label: "Version Created", 
    color: "bg-purple-100 text-purple-700 border-purple-300" 
  },
  unauthorized_attempt: { 
    icon: AlertTriangle, 
    label: "Unauthorized Attempt", 
    color: "bg-red-100 text-red-700 border-red-300" 
  },
  corruption_detected: { 
    icon: XCircle, 
    label: "Corruption Detected", 
    color: "bg-red-100 text-red-700 border-red-300" 
  },
  integrity_repair: { 
    icon: Shield, 
    label: "Integrity Repair", 
    color: "bg-yellow-100 text-yellow-700 border-yellow-300" 
  },
  signature_validation: { 
    icon: Lock, 
    label: "Signature Validation", 
    color: "bg-green-100 text-green-700 border-green-300" 
  }
};

export const IntegrityLogsTable = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Record Integrity Logs</h2>
        </div>
        <Badge variant="outline" className="text-xs">
          {mockIntegrityLogs.length} events
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        Hash-based integrity tracking, version control, and unauthorized access detection.
        This exceeds industry standards for document authenticity verification.
      </p>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Timestamp</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Before Hash</TableHead>
              <TableHead>After Hash</TableHead>
              <TableHead>Rule Triggered</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockIntegrityLogs.map((log) => {
              const config = eventTypeConfig[log.eventType];
              const Icon = config.icon;
              
              return (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {format(log.timestamp, "MMM dd, HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", config.color)}>
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {log.hashBefore}
                    </code>
                  </TableCell>
                  <TableCell>
                    {log.hashAfter ? (
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {log.hashAfter}
                      </code>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{log.ruleTriggered}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        log.isSystemEvent ? "bg-blue-500" : "bg-green-500"
                      )} />
                      <span className="text-sm">{log.userResponsible}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={log.confidenceScore} className="w-16 h-2" />
                      <span className="text-xs">{log.confidenceScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <span className="text-sm truncate block">{log.reason}</span>
                  </TableCell>
                  <TableCell>
                    {log.resolved ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
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
