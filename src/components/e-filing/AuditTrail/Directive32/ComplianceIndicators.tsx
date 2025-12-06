import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  FileCheck, 
  Lock, 
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplianceIndicator } from "./types";

interface ComplianceIndicatorsProps {
  indicators?: ComplianceIndicator[];
}

const defaultIndicators: ComplianceIndicator[] = [
  {
    id: "authenticity",
    title: "Record Authenticity",
    status: "compliant",
    checks: [
      { label: "Document hashing enabled", passed: true },
      { label: "Cryptographic signatures validated", passed: true },
      { label: "All changes traceable", passed: true }
    ]
  },
  {
    id: "accessibility",
    title: "Accessibility & Readability",
    status: "compliant",
    checks: [
      { label: "OSB-approved formats (PDF/A, XML, PNG)", passed: true },
      { label: "Zero corrupted files", passed: true },
      { label: "Reader compatibility tested", passed: true }
    ]
  },
  {
    id: "integrity",
    title: "Integrity & Perennity",
    status: "compliant",
    checks: [
      { label: "Daily backups successful", passed: true },
      { label: "Offsite storage confirmed", passed: true },
      { label: "No missing timestamps or metadata", passed: true }
    ]
  },
  {
    id: "security",
    title: "Reliability & Security",
    status: "compliant",
    checks: [
      { label: "Role-based access controls active", passed: true },
      { label: "Multi-factor authentication enabled", passed: true },
      { label: "Firewall & antivirus checks passing", passed: true }
    ]
  }
];

const indicatorIcons = {
  authenticity: ShieldCheck,
  accessibility: FileCheck,
  integrity: Database,
  security: Lock
};

const statusConfig = {
  compliant: {
    color: "bg-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    icon: CheckCircle2,
    label: "Compliant"
  },
  warning: {
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    icon: AlertTriangle,
    label: "Warning"
  },
  non_compliant: {
    color: "bg-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    icon: XCircle,
    label: "Non-Compliant"
  }
};

export const ComplianceIndicators = ({ 
  indicators = defaultIndicators 
}: ComplianceIndicatorsProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Directive 32 Compliance Indicators</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((indicator) => {
          const Icon = indicatorIcons[indicator.id as keyof typeof indicatorIcons] || ShieldCheck;
          const config = statusConfig[indicator.status];
          const StatusIcon = config.icon;

          return (
            <Card 
              key={indicator.id}
              className={cn(
                "border-2 transition-all hover:shadow-md",
                config.bgColor,
                config.borderColor
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-2 rounded-lg",
                      indicator.status === "compliant" ? "bg-green-100 dark:bg-green-900/50" : 
                      indicator.status === "warning" ? "bg-yellow-100 dark:bg-yellow-900/50" : 
                      "bg-red-100 dark:bg-red-900/50"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        indicator.status === "compliant" ? "text-green-600" : 
                        indicator.status === "warning" ? "text-yellow-600" : 
                        "text-red-600"
                      )} />
                    </div>
                    <h3 className="font-medium text-sm">{indicator.title}</h3>
                  </div>
                  <div className={cn("w-3 h-3 rounded-full", config.color)} />
                </div>

                <div className="space-y-2">
                  {indicator.checks.map((check, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      {check.passed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                      )}
                      <span className={cn(
                        check.passed ? "text-foreground" : "text-red-600"
                      )}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-border/50">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      indicator.status === "compliant" ? "bg-green-100 text-green-700 border-green-300" :
                      indicator.status === "warning" ? "bg-yellow-100 text-yellow-700 border-yellow-300" :
                      "bg-red-100 text-red-700 border-red-300"
                    )}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
