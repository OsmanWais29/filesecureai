import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Eye, FileText, Link, CheckCircle, Paperclip, History,
  DollarSign, Building2, AlertTriangle, FileCheck, Users
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { OSBRiskCategory, RiskLevel } from "./OSBComplianceFilters";

export interface OSBAuditEntry {
  id: string;
  timestamp: Date;
  user: {
    name: string;
    role: string;
  };
  category: OSBRiskCategory;
  eventType: string;
  estateName?: string;
  estateNumber?: string;
  details: string;
  directive?: string;
  biaSection?: string;
  riskLevel: RiskLevel;
  metadata?: Record<string, any>;
}

interface OSBTimelineEntryProps {
  entry: OSBAuditEntry;
  isSelected?: boolean;
  onSelect: (entry: OSBAuditEntry) => void;
}

const categoryIcons = {
  trust_account: DollarSign,
  estate_administration: Building2,
  aged_estates: AlertTriangle,
  disclosure_reporting: FileCheck,
  lit_practice: Users
};

const riskLevelColors = {
  critical: "bg-red-100 text-red-700 border-red-300",
  warning: "bg-orange-100 text-orange-700 border-orange-300",
  normal: "bg-green-100 text-green-700 border-green-300"
};

export const OSBTimelineEntry = ({ entry, isSelected = false, onSelect }: OSBTimelineEntryProps) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = categoryIcons[entry.category];

  const handleClick = () => {
    onSelect(entry);
  };

  return (
    <div
      className={cn(
        "relative pl-8 pb-6 border-l-2 transition-all",
        isSelected ? "border-primary" : "border-border"
      )}
    >
      {/* Timeline dot */}
      <div
        className={cn(
          "absolute left-0 top-2 -translate-x-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Entry content */}
      <div
        className={cn(
          "ml-4 p-4 rounded-lg border cursor-pointer transition-all",
          isSelected
            ? "bg-primary/5 border-primary"
            : "bg-card border-border hover:border-primary/50 hover:bg-accent/50"
        )}
        onClick={handleClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={riskLevelColors[entry.riskLevel]}>
                {entry.riskLevel}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
              </span>
            </div>
            <h4 className="font-semibold text-sm">{entry.eventType}</h4>
            {entry.estateNumber && (
              <p className="text-xs text-muted-foreground">
                Estate #{entry.estateNumber} {entry.estateName && `- ${entry.estateName}`}
              </p>
            )}
          </div>
        </div>

        {/* Details */}
        <p className="text-sm text-muted-foreground mb-3">{entry.details}</p>

        {/* Metadata row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              <strong>User:</strong> {entry.user.name}
            </span>
            {entry.directive && (
              <Badge variant="secondary" className="text-xs">
                {entry.directive}
              </Badge>
            )}
            {entry.biaSection && (
              <Badge variant="secondary" className="text-xs">
                BIA {entry.biaSection}
              </Badge>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {isSelected && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <Button size="sm" variant="ghost" className="h-8 text-xs">
              <Eye className="h-3 w-3 mr-1" />
              View Document
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Add Note
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs">
              <Link className="h-3 w-3 mr-1" />
              Link OSB Section
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Mark Resolved
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs">
              <Paperclip className="h-3 w-3 mr-1" />
              Attach File
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs">
              <History className="h-3 w-3 mr-1" />
              Versions
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
