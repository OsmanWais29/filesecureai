
import React, { useState } from "react";
import { Risk } from "../types";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface RiskProps {
  risks?: Risk[];
  documentId: string;
  isLoading?: boolean;
}

export const RiskAssessment: React.FC<RiskProps> = ({ risks = [], documentId, isLoading = false }) => {
  const { toast } = useToast();
  const [expandedRiskId, setExpandedRiskId] = useState<string | null>(null);

  // Helper to properly format BIA references
  const formatBIAReference = (ref: string) => {
    if (!ref) return "Not specified";
    
    // If it already includes BIA or OSB references, return as is
    if (ref.includes("BIA") || ref.includes("OSB") || ref.includes("Section") || ref.includes("Directive")) {
      return ref;
    }
    
    // Look for section numbers or rule patterns
    const sectionMatch = ref.match(/(?:section|s\.)\s*(\d+(?:\.\d+)?)/i);
    if (sectionMatch) {
      return `BIA Section ${sectionMatch[1]}`;
    }
    
    const ruleMatch = ref.match(/(?:rule)\s*(\d+)/i);
    if (ruleMatch) {
      return `BIA Rule ${ruleMatch[1]}`;
    }
    
    // Default case: add BIA prefix if it appears to be a reference
    if (/^\d+(\.\d+)?$/.test(ref)) {
      return `BIA Section ${ref}`;
    }
    
    return ref;
  };

  // Sort risks by severity
  const sortedRisks = React.useMemo(() => {
    if (!risks || risks.length === 0) {
      return [];
    }
    
    return [...risks].sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2, undefined: 3 };
      return severityOrder[(a.severity as keyof typeof severityOrder) || 'undefined'] - 
             severityOrder[(b.severity as keyof typeof severityOrder) || 'undefined'];
    });
  }, [risks]);
  
  const toggleRisk = (riskId: string) => {
    setExpandedRiskId(expandedRiskId === riskId ? null : riskId);
  };
  
  // Filter out incomplete risk entries and ensure proper structure 
  const validRisks = sortedRisks.filter(risk => {
    if (!risk) return false;
    // Ensure risk has at least a description
    return risk.description && (risk.type || risk.description);
  }).map((risk, index) => {
    // Assign default values for any missing fields
    return {
      ...risk,
      type: risk.type || `Risk Item ${index + 1}`,
      severity: risk.severity || 'medium',
      regulation: risk.regulation || 'BIA Requirement',
      solution: risk.solution || 'Review document for compliance'
    };
  });

  // Debug console log to investigate risks data
  console.log('Risk Assessment Props:', { documentId, risksCount: risks?.length, validRisksCount: validRisks.length });
  console.log('Valid Risks Data:', validRisks);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-medium">Risk Assessment</h3>
        </div>
        <Card className="animate-pulse h-16 bg-muted/50" />
        <Card className="animate-pulse h-16 bg-muted/50" />
      </div>
    );
  }

  if (!validRisks || validRisks.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <h3 className="text-sm font-medium">Risk Assessment</h3>
        </div>
        <Card className="p-3">
          <div className="text-sm text-muted-foreground">
            <p>No risks detected in document.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-medium">Risk Assessment</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {validRisks.length} {validRisks.length === 1 ? 'risk' : 'risks'} found
        </span>
      </div>

      <div className="space-y-2">
        {validRisks.map((risk, index) => (
          <Card 
            key={`${risk.type}-${index}`}
            className={cn(
              "overflow-hidden transition-all",
              expandedRiskId === `${risk.type}-${index}` ? "max-h-96" : "max-h-20"
            )}
          >
            <div className="p-3 cursor-pointer" onClick={() => toggleRisk(`${risk.type}-${index}`)}>
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2">
                  {risk.severity === 'high' && (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                  {risk.severity === 'medium' && (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                  {risk.severity === 'low' && (
                    <Info className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="font-medium text-sm">
                    {risk.type || 'Risk Issue'}
                  </span>
                </div>
                <span className={cn(
                  "text-xs rounded-full px-2 py-0.5",
                  risk.severity === 'high' ? "bg-destructive/10 text-destructive" :
                  risk.severity === 'medium' ? "bg-amber-500/10 text-amber-500" :
                  "bg-blue-500/10 text-blue-500"
                )}>
                  {risk.severity || 'medium'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {risk.description}
              </p>
            </div>
            
            {expandedRiskId === `${risk.type}-${index}` && (
              <>
                <Separator />
                <div className="p-3 space-y-2">
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold">Description</h4>
                    <p className="text-xs">{risk.description}</p>
                  </div>
                  
                  {risk.regulation && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold">Regulation Reference</h4>
                      <p className="text-xs">{formatBIAReference(risk.regulation)}</p>
                    </div>
                  )}
                  
                  {risk.solution && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold">Recommended Solution</h4>
                      <p className="text-xs">{risk.solution}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2 pt-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setExpandedRiskId(null)}
                    >
                      Close
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Task created",
                          description: `Added task for "${risk.type}"`,
                        });
                      }}
                    >
                      Create Task
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
