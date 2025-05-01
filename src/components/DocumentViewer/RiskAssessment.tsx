
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Check, ExternalLink, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Risk {
  type: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  regulation?: string;
  impact?: string;
  requiredAction?: string;
  solution?: string;
  deadline?: string;
}

interface RiskAssessmentProps {
  risks: Risk[];
  documentId: string;
  isLoading: boolean;
}

export const RiskAssessment = ({ risks: initialRisks = [], documentId, isLoading }: RiskAssessmentProps) => {
  const [risks, setRisks] = useState<Risk[]>(initialRisks);
  const [loading, setLoading] = useState(isLoading || !risks.length);
  const [exaReferences, setExaReferences] = useState<any[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (documentId) {
      fetchRiskData();
    }
  }, [documentId]);

  useEffect(() => {
    if (initialRisks?.length > 0) {
      setRisks(initialRisks);
      setLoading(false);
    }
  }, [initialRisks]);

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      
      console.log("Fetching risk data for document:", documentId);
      
      // First check document status
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('ai_processing_status')
        .eq('id', documentId)
        .maybeSingle();
        
      if (docError) {
        console.error('Error fetching document status:', docError);
        setLoadError(`Failed to check document status: ${docError.message}`);
      } else if (docData?.ai_processing_status === 'processing') {
        setAnalysisStatus('processing');
        setLoading(false);
        return;
      }
      
      // Fetch document analysis from document_analysis table
      const { data: analysisData, error: analysisError } = await supabase
        .from('document_analysis')
        .select('content')
        .eq('document_id', documentId)
        .maybeSingle();

      if (analysisError) {
        console.error('Error fetching document analysis:', analysisError);
        setLoadError(`Failed to fetch analysis: ${analysisError.message}`);
      }

      if (analysisData?.content?.risks) {
        console.log("Found risks in document analysis:", analysisData.content.risks.length);
        setRisks(analysisData.content.risks);
        
        // Also save any exa references
        if (analysisData.content.exa_references && analysisData.content.exa_references.length > 0) {
          console.log("Found Exa references:", analysisData.content.exa_references.length);
          setExaReferences(analysisData.content.exa_references);
        }
        
        setAnalysisStatus('complete');
      } else {
        // If no risk data in document_analysis, check the document metadata
        const { data: docMetaData, error: docMetaError } = await supabase
          .from('documents')
          .select('metadata')
          .eq('id', documentId)
          .single();

        if (docMetaError) {
          console.error('Error fetching document metadata:', docMetaError);
          setLoadError(`Failed to fetch document: ${docMetaError.message}`);
        }

        if (docMetaData?.metadata?.risks) {
          console.log("Found risks in document metadata");
          setRisks(docMetaData.metadata.risks);
          setAnalysisStatus('complete');
        } else {
          console.log("No risks found in document analysis or metadata");
          setAnalysisStatus('no_data');
        }
      }
    } catch (error) {
      console.error('Error loading risk data:', error);
      setLoadError(`Error loading risk data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForceAnalysis = async () => {
    try {
      toast.info("Initiating document analysis...");
      
      // Update document status to processing
      await supabase
        .from('documents')
        .update({ ai_processing_status: 'processing' })
        .eq('id', documentId);
      
      // Fetch document path
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('storage_path, title')
        .eq('id', documentId)
        .single();
        
      if (docError || !docData) {
        throw new Error(`Failed to get document details: ${docError?.message}`);
      }
      
      // Call the edge function to analyze the document
      const { data, error } = await supabase.functions.invoke('process-ai-request', {
        body: { 
          documentId,
          storagePath: docData.storage_path,
          title: docData.title
        }
      });
      
      if (error) {
        throw new Error(`Analysis failed: ${error.message}`);
      }
      
      // Refresh the risk data
      toast.success("Document analysis complete");
      fetchRiskData();
      
    } catch (error) {
      console.error("Force analysis error:", error);
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Determine appropriate badge color based on severity
  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-500 hover:bg-red-600';
      case 'medium':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'low':
        return 'bg-emerald-500 hover:bg-emerald-600';
      default:
        return 'bg-slate-500 hover:bg-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (loadError) {
    return (
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-medium">Error Loading Analysis</p>
          </div>
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <button 
            onClick={fetchRiskData}
            className="text-xs px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  if (analysisStatus === 'processing') {
    return (
      <Card>
        <CardContent className="pt-4 flex items-center justify-center text-center h-32">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-sm text-muted-foreground">Analysis in progress...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analysisStatus === 'no_data') {
    return (
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <p className="text-sm font-medium">No Analysis Available</p>
          </div>
          <p className="text-sm text-muted-foreground">This document has not been analyzed yet.</p>
          <button 
            onClick={handleForceAnalysis}
            className="text-xs px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
          >
            Analyze Document
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!risks || risks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-4 flex items-center justify-center text-center h-32">
          <div className="flex flex-col items-center space-y-2">
            <Check className="h-8 w-8 text-emerald-500" />
            <p className="text-sm text-muted-foreground">No compliance risks detected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {risks.map((risk, index) => (
        <Card key={index} className="overflow-hidden">
          <div className={`h-1 ${getSeverityColor(risk.severity)}`} />
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h4 className="font-medium text-sm">{risk.type}</h4>
                <p className="text-sm text-muted-foreground">{risk.description}</p>
              </div>
              <Badge 
                className={`${getSeverityColor(risk.severity)} text-white`}
              >
                {risk.severity}
              </Badge>
            </div>

            {risk.regulation && (
              <div className="text-xs space-y-1">
                <span className="font-medium">Regulation:</span>{" "}
                <span className="text-muted-foreground">{risk.regulation}</span>
              </div>
            )}

            {(risk.impact || risk.requiredAction) && (
              <div className="text-xs space-y-1 border-t pt-2">
                {risk.impact && (
                  <div>
                    <span className="font-medium">Impact:</span>{" "}
                    <span className="text-muted-foreground">{risk.impact}</span>
                  </div>
                )}
                
                {risk.requiredAction && (
                  <div>
                    <span className="font-medium">Required Action:</span>{" "}
                    <span className="text-muted-foreground">{risk.requiredAction}</span>
                  </div>
                )}
              </div>
            )}

            {(risk.solution || risk.deadline) && (
              <div className="text-xs space-y-1 border-t pt-2">
                {risk.solution && (
                  <div>
                    <span className="font-medium">Solution:</span>{" "}
                    <span className="text-muted-foreground">{risk.solution}</span>
                  </div>
                )}
                
                {risk.deadline && (
                  <div>
                    <span className="font-medium">Deadline:</span>{" "}
                    <span className="text-muted-foreground">{risk.deadline}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {exaReferences.length > 0 && (
        <div className="pt-2">
          <h4 className="text-sm font-medium flex items-center gap-1 pb-2">
            <AlertCircle className="h-4 w-4" />
            Regulatory References
          </h4>
          <div className="space-y-2 text-xs">
            {exaReferences.map((ref, index) => (
              <Card key={index} className="p-2">
                <a 
                  href={ref.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-1 hover:text-primary"
                >
                  <ExternalLink className="h-3 w-3 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{ref.title}</span>
                </a>
                <p className="text-muted-foreground mt-1 line-clamp-2">
                  {ref.snippet}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
