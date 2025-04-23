
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, CheckCircle, ExternalLink, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Risk {
  type: string;
  severity: "high" | "medium" | "low";
  description: string;
  biaSection?: string;
  solution?: string;
  referenceUrl?: string;
}

interface RiskAssessmentProps {
  documentId: string;
}

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({ documentId }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [documentType, setDocumentType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRiskAssessment = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("document_analysis")
        .select("content")
        .eq("document_id", documentId)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          setError("No analysis found for this document");
        } else {
          throw fetchError;
        }
        return;
      }

      if (!data?.content?.analysis) {
        setError("Analysis data is incomplete");
        return;
      }

      // Extract risks from analysis
      const analysisData = data.content.analysis;
      setDocumentType(analysisData.documentType || "Unknown Document");
      
      const extractedRisks: Risk[] = analysisData.riskAssessment?.map((risk: any) => ({
        type: risk.type || "General Risk",
        severity: risk.severity?.toLowerCase() || "medium",
        description: risk.description || "No description provided",
        biaSection: risk.biaReference || risk.biaSection,
        solution: risk.solution || risk.recommendation,
        referenceUrl: risk.referenceUrl || `https://laws-lois.justice.gc.ca/eng/acts/B-3/section-${risk.biaSection || "1"}.html`
      })) || [];
      
      // If no risks are explicitly provided but we have compliance issues, convert them to risks
      if (extractedRisks.length === 0 && analysisData.complianceIssues) {
        const complianceRisks = Array.isArray(analysisData.complianceIssues) 
          ? analysisData.complianceIssues 
          : [analysisData.complianceIssues];
          
        complianceRisks.forEach((issue: any) => {
          if (typeof issue === 'string') {
            extractedRisks.push({
              type: "Compliance",
              severity: "medium",
              description: issue,
            });
          } else if (issue && typeof issue === 'object') {
            extractedRisks.push({
              type: "Compliance",
              severity: issue.severity?.toLowerCase() || "medium",
              description: issue.description || "Compliance issue detected",
              biaSection: issue.biaSection,
              solution: issue.solution || issue.recommendation
            });
          }
        });
      }
      
      // If still no risks, add a placeholder for very clean documents
      if (extractedRisks.length === 0) {
        extractedRisks.push({
          type: "Document Review",
          severity: "low",
          description: "No significant risks detected in initial analysis",
          solution: "Perform a manual review to confirm"
        });
      }

      setRisks(extractedRisks);
    } catch (err: any) {
      console.error("Error fetching risk assessment:", err);
      setError(`Failed to load risk assessment: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAnalysis = async () => {
    try {
      setRefreshing(true);
      
      const { error: analysisError } = await supabase.functions.invoke("process-document", {
        body: {
          documentId,
          reanalyze: true
        },
      });

      if (analysisError) throw analysisError;
      
      toast({
        title: "Analysis Started",
        description: "The document is being reanalyzed. Results will update shortly.",
      });
      
      // Wait a moment before fetching updated results
      setTimeout(() => {
        fetchRiskAssessment();
        setRefreshing(false);
      }, 3000);
      
    } catch (err: any) {
      console.error("Error refreshing analysis:", err);
      setRefreshing(false);
      
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: err.message || "Failed to start the analysis process",
      });
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchRiskAssessment();
    }
  }, [documentId]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return <AlertCircle className="h-4 w-4" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4" />;
      case "low":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Risk Assessment</CardTitle>
        {documentType && <Badge variant="outline">{documentType}</Badge>}
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <p className="text-center text-muted-foreground">{error}</p>
            <Button onClick={handleRefreshAnalysis} disabled={refreshing}>
              {refreshing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {refreshing ? "Analyzing..." : "Run Risk Analysis"}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-4">
              {risks.map((risk, index) => (
                <div
                  key={index}
                  className="rounded-md border p-4 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={getSeverityColor(risk.severity)} className="flex items-center gap-1">
                      {getSeverityIcon(risk.severity)}
                      <span className="capitalize">{risk.severity}</span>
                    </Badge>
                    <span className="text-xs font-medium">{risk.type}</span>
                  </div>
                  
                  <p className="mb-2">{risk.description}</p>
                  
                  {risk.biaSection && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium">BIA Section:</span> {risk.biaSection}
                    </div>
                  )}
                  
                  {risk.solution && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Solution:</span> {risk.solution}
                    </div>
                  )}
                  
                  {risk.referenceUrl && (
                    <div className="mt-2">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        asChild
                      >
                        <a
                          href={risk.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          View Reference <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAnalysis}
                disabled={refreshing}
              >
                {refreshing ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {refreshing ? "Refreshing..." : "Refresh Analysis"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
