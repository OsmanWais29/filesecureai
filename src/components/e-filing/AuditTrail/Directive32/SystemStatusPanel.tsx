import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Shield, 
  Server, 
  Lock, 
  Users, 
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { SystemStatus } from "./types";

interface SystemStatusPanelProps {
  status?: SystemStatus;
}

const defaultStatus: SystemStatus = {
  backupStatus: {
    lastSuccessful: new Date("2025-12-06T05:00:00Z"),
    offsiteValidated: true
  },
  virusScanStatus: "passed",
  serverUptime: "99.99%",
  mfaPolicyStatus: "enabled",
  permissionHealth: "healthy",
  encryptionStatus: "enabled",
  storageRedundancy: "replicated"
};

export const SystemStatusPanel = ({ status = defaultStatus }: SystemStatusPanelProps) => {
  const statusItems = [
    {
      id: "backup",
      icon: Database,
      label: "Backup Status",
      value: format(status.backupStatus.lastSuccessful, "MMM dd, HH:mm"),
      subValue: "Last successful backup",
      status: "healthy"
    },
    {
      id: "offsite",
      icon: HardDrive,
      label: "Offsite Storage",
      value: status.backupStatus.offsiteValidated ? "Validated" : "Not Validated",
      subValue: "Offsite backup location",
      status: status.backupStatus.offsiteValidated ? "healthy" : "warning"
    },
    {
      id: "virus",
      icon: Shield,
      label: "Virus/Malware Scan",
      value: status.virusScanStatus === "passed" ? "Passed" : 
             status.virusScanStatus === "running" ? "Running" : "Failed",
      subValue: "Latest security scan",
      status: status.virusScanStatus === "passed" ? "healthy" : 
              status.virusScanStatus === "running" ? "warning" : "critical"
    },
    {
      id: "uptime",
      icon: Server,
      label: "Server Uptime",
      value: status.serverUptime,
      subValue: "Current availability",
      status: "healthy"
    },
    {
      id: "mfa",
      icon: Lock,
      label: "MFA Policy",
      value: status.mfaPolicyStatus === "enabled" ? "Enabled" : "Disabled",
      subValue: "Multi-factor authentication",
      status: status.mfaPolicyStatus === "enabled" ? "healthy" : "critical"
    },
    {
      id: "permissions",
      icon: Users,
      label: "Permission Health",
      value: status.permissionHealth === "healthy" ? "Healthy" : "Issues Detected",
      subValue: "Role-based access controls",
      status: status.permissionHealth === "healthy" ? "healthy" : "warning"
    },
    {
      id: "encryption",
      icon: Shield,
      label: "Encryption",
      value: status.encryptionStatus === "enabled" ? "Enabled" : "Disabled",
      subValue: "Data encryption at rest",
      status: status.encryptionStatus === "enabled" ? "healthy" : "critical"
    },
    {
      id: "redundancy",
      icon: RefreshCw,
      label: "Storage Redundancy",
      value: status.storageRedundancy === "replicated" ? "Replicated" : "Single",
      subValue: "Data redundancy level",
      status: status.storageRedundancy === "replicated" ? "healthy" : "warning"
    }
  ];

  const getStatusColor = (statusType: string) => {
    switch (statusType) {
      case "healthy": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "critical": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (statusType: string) => {
    switch (statusType) {
      case "healthy": return CheckCircle2;
      case "warning": return AlertTriangle;
      case "critical": return AlertTriangle;
      default: return CheckCircle2;
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Server className="h-4 w-4" />
            System Status & Safeguards
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
            All Systems Operational
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {statusItems.map((item) => {
          const Icon = item.icon;
          const StatusIcon = getStatusIcon(item.status);
          
          return (
            <div 
              key={item.id}
              className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-background rounded">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.subValue}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.value}</span>
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  getStatusColor(item.status)
                )} />
              </div>
            </div>
          );
        })}

        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            These indicators cover Directive 32 requirements for security, reliability, 
            backup, continuity, and record perennity.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
