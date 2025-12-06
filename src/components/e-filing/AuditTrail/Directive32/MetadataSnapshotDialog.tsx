import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Hash, 
  Clock, 
  User, 
  Settings, 
  Shield,
  Link2,
  Users
} from "lucide-react";
import { format } from "date-fns";
import type { AuditLogEntry, CustodyEvent, AccessControlEntry } from "./types";

interface MetadataSnapshotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: AuditLogEntry | null;
}

// Mock metadata for demonstration
const getMockMetadata = (entry: AuditLogEntry | null) => {
  if (!entry) return null;
  
  return {
    documentId: `DOC-${entry.id}-${Date.now()}`,
    hash: entry.hashAfter || "sha256:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    originalUploadTimestamp: new Date("2025-11-15T10:30:00Z"),
    originalUploaderId: "USR-001-JSMITH",
    fileType: "application/pdf",
    encoding: "UTF-8",
    version: 3,
    scannerModel: "Fujitsu fi-7160",
    dpi: 300,
    pdfaCompliant: true,
    ocrEngineVersion: "Tesseract 5.3.1",
    osbMetadataFields: {
      "Estate Number": entry.estateFile,
      "Form Type": "Form 48",
      "Debtor Name": "John Doe",
      "Filing Date": "2025-11-15"
    },
    previousHash: entry.hashBefore || "sha256:z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4",
    newHash: entry.hashAfter || "sha256:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    chainOfCustody: [
      { 
        timestamp: new Date("2025-11-15T10:30:00Z"), 
        action: "Created", 
        user: "J. Smith", 
        details: "Original document upload" 
      },
      { 
        timestamp: new Date("2025-11-20T14:15:00Z"), 
        action: "Reviewed", 
        user: "M. Johnson", 
        details: "Compliance review completed" 
      },
      { 
        timestamp: new Date("2025-12-01T09:00:00Z"), 
        action: "Updated", 
        user: "A. Thompson", 
        details: "Added creditor information" 
      }
    ] as CustodyEvent[],
    accessControlList: [
      { userId: "USR-001", userName: "J. Smith", role: "LIT", permissions: ["read", "write", "delete"] },
      { userId: "USR-002", userName: "M. Johnson", role: "Case Admin", permissions: ["read", "write"] },
      { userId: "USR-003", userName: "A. Thompson", role: "Assistant", permissions: ["read"] }
    ] as AccessControlEntry[]
  };
};

export const MetadataSnapshotDialog = ({ 
  open, 
  onOpenChange, 
  entry 
}: MetadataSnapshotDialogProps) => {
  const metadata = getMockMetadata(entry);

  if (!entry || !metadata) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Metadata Snapshot
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">
            {/* Document Identification */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Document Identification
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Document ID</div>
                  <code className="font-mono text-xs">{metadata.documentId}</code>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Current Hash (SHA-256)</div>
                  <code className="font-mono text-xs break-all">{metadata.hash}</code>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">File Type / Encoding</div>
                  <div>{metadata.fileType} • {metadata.encoding}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Version</div>
                  <Badge variant="outline">v{metadata.version}</Badge>
                </div>
              </div>
            </section>

            <Separator />

            {/* Origin Information */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Origin Information
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Original Upload</div>
                  <div>{format(metadata.originalUploadTimestamp, "PPpp")}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Original Uploader</div>
                  <code className="font-mono text-xs">{metadata.originalUploaderId}</code>
                </div>
              </div>
            </section>

            <Separator />

            {/* Conversion Metadata */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Conversion Metadata
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Scanner Model</div>
                  <div>{metadata.scannerModel}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">DPI</div>
                  <div>{metadata.dpi}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">PDF/A Compliance</div>
                  <Badge variant={metadata.pdfaCompliant ? "default" : "destructive"}>
                    {metadata.pdfaCompliant ? "Compliant" : "Non-Compliant"}
                  </Badge>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">OCR Engine Version</div>
                  <div>{metadata.ocrEngineVersion}</div>
                </div>
              </div>
            </section>

            <Separator />

            {/* OSB Metadata Fields */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                OSB-Defined Metadata Fields
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(metadata.osbMetadataFields).map(([key, value]) => (
                  <div key={key} className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">{key}</div>
                    <div>{value}</div>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Hash Changes */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Alteration Tracking
              </h3>
              <div className="space-y-2 text-sm">
                <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="text-xs text-muted-foreground mb-1">Previous Hash (Before Action)</div>
                  <code className="font-mono text-xs break-all">{metadata.previousHash}</code>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-xs text-muted-foreground mb-1">New Hash (After Action)</div>
                  <code className="font-mono text-xs break-all">{metadata.newHash}</code>
                </div>
              </div>
            </section>

            <Separator />

            {/* Chain of Custody */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Chain of Custody Timeline
              </h3>
              <div className="space-y-3">
                {metadata.chainOfCustody.map((event, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{event.action}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(event.timestamp, "PPp")}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        by {event.user}
                      </div>
                      <div className="text-sm mt-1">{event.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Access Control List */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Access Control List (at Event Time)
              </h3>
              <div className="space-y-2">
                {metadata.accessControlList.map((acl, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{acl.userName}</div>
                        <div className="text-xs text-muted-foreground">{acl.role}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {acl.permissions.map((perm) => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
