
import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface RiskItem {
  type: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  regulation?: string;
  impact?: string;
  requiredAction?: string;
  solution?: string;
  deadline?: string;
  id?: string;
  status?: 'open' | 'acknowledged' | 'resolved';
}

interface RiskAssessmentProps {
  risks: RiskItem[];
  documentId: string;
  isLoading: boolean;
}

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({
  risks,
  documentId,
  isLoading
}) => {
  const [localRisks, setLocalRisks] = useState<RiskItem[]>(
    risks.map(risk => ({ ...risk, status: risk.status || 'open', id: risk.id || `risk-${Math.random().toString(36).substring(2, 9)}` }))
  );
  
  // Update risks when props change
  React.useEffect(() => {
    if (risks && !isLoading) {
      setLocalRisks(
        risks.map(risk => ({ 
          ...risk, 
          status: risk.status || 'open',
          id: risk.id || `risk-${Math.random().toString(36).substring(2, 9)}`
        }))
      );
    }
  }, [risks, isLoading]);

  const handleStatusChange = (riskId: string | undefined, newStatus: 'open' | 'acknowledged' | 'resolved') => {
    if (!riskId) return;
    
    setLocalRisks(prev => prev.map(risk => 
      risk.id === riskId ? { ...risk, status: newStatus } : risk
    ));
    
    // In a real app, you would save this change to the database
    console.log(`Risk ${riskId} status changed to ${newStatus} for document ${documentId}`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'medium':
        return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-green-500 bg-green-50 border-green-200';
      default:
        return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'acknowledged':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <XCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!localRisks || localRisks.length === 0) {
    return (
      <div className="text-center py-6 border rounded-md bg-slate-50">
        <AlertTriangle className="h-6 w-6 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No risks detected in this document.</p>
        <p className="text-xs text-muted-foreground mt-1">Document may still need manual review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <span className="font-medium text-sm">
          {localRisks.length} {localRisks.length === 1 ? 'risk' : 'risks'} identified
        </span>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {localRisks.map((risk, index) => (
          <AccordionItem key={risk.id || index} value={risk.id || `risk-${index}`} className="border mb-2 rounded-md">
            <AccordionTrigger className="px-3 py-2 hover:no-underline">
              <div className="flex items-center justify-between w-full text-left">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${getSeverityColor(risk.severity)}`}>
                    {risk.severity.toUpperCase()}
                  </Badge>
                  <span className="text-sm font-medium">{risk.type}</span>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 pt-0">
              <div className="space-y-3">
                <p className="text-sm">{risk.description}</p>
                
                {risk.regulation && (
                  <div className="text-sm">
                    <span className="font-medium">Regulation:</span> {risk.regulation}
                  </div>
                )}
                
                {risk.impact && (
                  <div className="text-sm">
                    <span className="font-medium">Impact:</span> {risk.impact}
                  </div>
                )}
                
                {risk.solution && (
                  <div className="text-sm">
                    <span className="font-medium">Solution:</span> {risk.solution}
                  </div>
                )}
                
                {risk.deadline && (
                  <div className="text-sm">
                    <span className="font-medium">Deadline:</span> {risk.deadline}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-4 pt-2 border-t">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(risk.status || 'open')}
                    <span className="text-xs text-muted-foreground capitalize">
                      {risk.status || 'open'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleStatusChange(risk.id, 'acknowledged')}
                      disabled={risk.status === 'acknowledged'}
                    >
                      Acknowledge
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleStatusChange(risk.id, 'resolved')}
                      disabled={risk.status === 'resolved'}
                      className={risk.status === 'resolved' ? 'bg-green-50 text-green-600 border-green-200' : ''}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
