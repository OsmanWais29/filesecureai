import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  FileWarning,
  Database,
  Link2,
  FileX,
  Shield,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { QualityAssuranceLog } from "./types";

const mockQALogs: QualityAssuranceLog[] = [
  {
    id: "1",
    timestamp: new Date("2025-12-06T14:30:00Z"),
    issueType: "failed_ocr",
    severity: "medium",
    detectedIssue: "OCR confidence below threshold (65%) for page 3",
    automatedFix: "Re-processed with enhanced image preprocessing",
    approvedBy: "J. Smith",
    complianceNote: "Manual verification confirmed accuracy",
    resolvedAt: new Date("2025-12-06T15:00:00Z"),
    status: "resolved"
  },
  {
    id: "2",
    timestamp: new Date("2025-12-06T10:15:00Z"),
    issueType: "missing_metadata",
    severity: "high",
    detectedIssue: "Estate number missing from document metadata",
    automatedFix: "Extracted from document content via AI",
    approvedBy: "M. Johnson",
    complianceNote: "Verified against case file",
    resolvedAt: new Date("2025-12-06T10:45:00Z"),
    status: "resolved"
  },
  {
    id: "3",
    timestamp: new Date("2025-12-05T16:00:00Z"),
    issueType: "invalid_xml",
    severity: "critical",
    detectedIssue: "XML output failed OSB schema validation",
    status: "in_progress"
  },
  {
    id: "4",
    timestamp: new Date("2025-12-05T09:30:00Z"),
    issueType: "backup_failure",
    severity: "critical",
    detectedIssue: "Offsite backup sync failed due to network timeout",
    automatedFix: "Retry initiated with exponential backoff",
    resolvedAt: new Date("2025-12-05T10:00:00Z"),
    status: "resolved"
  },
  {
    id: "5",
    timestamp: new Date("2025-12-04T14:00:00Z"),
    issueType: "permission_inconsistency",
    severity: "low",
    detectedIssue: "User permission mismatch detected during access audit",
    automatedFix: "Permissions synchronized with role definition",
    approvedBy: "A. Thompson",
    complianceNote: "No unauthorized access occurred",
    resolvedAt: new Date("2025-12-04T14:30:00Z"),
    status: "resolved"
  }
];

const issueTypeConfig = {
  failed_ocr: { icon: FileWarning, label: "Failed OCR" },
  corrupted_file: { icon: FileX, label: "Corrupted File" },
  missing_metadata: { icon: Database, label: "Missing Metadata" },
  broken_linkage: { icon: Link2, label: "Broken Linkage" },
  invalid_xml: { icon: FileX, label: "Invalid XML" },
  backup_failure: { icon: Database, label: "Backup Failure" },
  permission_inconsistency: { icon: Users, label: "Permission Issue" }
};

const severityConfig = {
  critical: { color: "bg-red-100 text-red-700 border-red-300" },
  high: { color: "bg-orange-100 text-orange-700 border-orange-300" },
  medium: { color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  low: { color: "bg-blue-100 text-blue-700 border-blue-300" }
};

const statusConfig = {
  open: { icon: AlertTriangle, color: "text-red-600", label: "Open" },
  in_progress: { icon: Clock, color: "text-yellow-600", label: "In Progress" },
  resolved: { icon: CheckCircle2, color: "text-green-600", label: "Resolved" }
};

export const QualityAssuranceTable = () => {
  const openIssues = mockQALogs.filter(log => log.status !== "resolved").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Quality Assurance Log</h2>
        </div>
        <div className="flex items-center gap-2">
          {openIssues > 0 && (
            <Badge variant="destructive" className="text-xs">
              {openIssues} Open Issues
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {mockQALogs.length} total events
          </Badge>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Directive 32 requires a QA program. This log provides evidence of issue detection,
        automated remediation, and staff-approved corrections for SERP/OSB audits.
      </p>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Timestamp</TableHead>
              <TableHead>Issue Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Detected Issue</TableHead>
              <TableHead>Automated Fix</TableHead>
              <TableHead>Approved By</TableHead>
              <TableHead>Compliance Note</TableHead>
              <TableHead>Resolved At</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockQALogs.map((log) => {
              const typeConfig = issueTypeConfig[log.issueType];
              const TypeIcon = typeConfig.icon;
              const sevConfig = severityConfig[log.severity];
              const statConfig = statusConfig[log.status];
              const StatusIcon = statConfig.icon;
              
              return (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {format(log.timestamp, "MMM dd, HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{typeConfig.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs capitalize", sevConfig.color)}>
                      {log.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <span className="text-sm truncate block">{log.detectedIssue}</span>
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    {log.automatedFix ? (
                      <span className="text-xs truncate block">{log.automatedFix}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.approvedBy || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    {log.complianceNote ? (
                      <span className="text-xs truncate block">{log.complianceNote}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.resolvedAt ? (
                      format(log.resolvedAt, "MMM dd, HH:mm")
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        log.status === "resolved" ? "bg-green-50 border-green-300" :
                        log.status === "in_progress" ? "bg-yellow-50 border-yellow-300" :
                        "bg-red-50 border-red-300"
                      )}
                    >
                      <StatusIcon className={cn("h-3 w-3 mr-1", statConfig.color)} />
                      {statConfig.label}
                    </Badge>
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
