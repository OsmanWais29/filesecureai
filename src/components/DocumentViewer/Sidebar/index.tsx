
import { DocumentDetails } from "../DocumentDetails";
import { RiskAssessment } from "../RiskAssessment";
import { DeadlineManager } from "../DeadlineManager";
import { DocumentDetails as DocumentDetailsType, Risk as DocumentRisk } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, FileText, Calendar, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  document: DocumentDetailsType;
  onDeadlineUpdated: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ document, onDeadlineUpdated }) => {
  console.log("[DEBUG] Document analysis in Sidebar:", document.analysis);
  console.log("[DEBUG] Extracted info in Sidebar:", document.analysis?.[0]?.content?.extracted_info || {});
  console.log("[DEBUG] Risks in Sidebar:", document.analysis?.[0]?.content?.risks || []);
  console.log("[DEBUG] Form type detected:", document.type);
  console.log("[DEBUG] Full document data:", document);
  
  const hasAnalysis = document.analysis && document.analysis.length > 0;
  const hasValidAnalysis = hasAnalysis && document.analysis?.[0]?.content?.extracted_info;
  
  // Check if document has analysis errors
  const hasAnalysisError = document.metadata?.analysis_status === 'error' || 
                          document.ai_processing_status === 'error';

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {/* Document Details */}
          {hasValidAnalysis ? (
            <DocumentDetails
              clientName={document.analysis?.[0]?.content?.extracted_info?.clientName as string}
              trusteeName={document.analysis?.[0]?.content?.extracted_info?.trusteeName as string}
              administratorName={document.analysis?.[0]?.content?.extracted_info?.administratorName as string}
              dateSigned={document.analysis?.[0]?.content?.extracted_info?.dateSigned as string}
              formNumber={document.analysis?.[0]?.content?.extracted_info?.formNumber as string}
              estateNumber={document.analysis?.[0]?.content?.extracted_info?.estateNumber as string}
              district={document.analysis?.[0]?.content?.extracted_info?.district as string}
              divisionNumber={document.analysis?.[0]?.content?.extracted_info?.divisionNumber as string}
              courtNumber={document.analysis?.[0]?.content?.extracted_info?.courtNumber as string}
              meetingOfCreditors={document.analysis?.[0]?.content?.extracted_info?.meetingOfCreditors as string}
              chairInfo={document.analysis?.[0]?.content?.extracted_info?.chairInfo as string}
              securityInfo={document.analysis?.[0]?.content?.extracted_info?.securityInfo as string}
              dateBankruptcy={document.analysis?.[0]?.content?.extracted_info?.dateBankruptcy as string}
              officialReceiver={document.analysis?.[0]?.content?.extracted_info?.officialReceiver as string}
              summary={document.analysis?.[0]?.content?.extracted_info?.summary as string}
              documentId={document.id}
              filingDate={document.analysis?.[0]?.content?.extracted_info?.filingDate as string}
              submissionDeadline={document.analysis?.[0]?.content?.extracted_info?.submissionDeadline as string}
              documentStatus={document.analysis?.[0]?.content?.extracted_info?.documentStatus as string}
              formType={document.type}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Document Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Title:</span>
                    <p className="font-medium">{document.title}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p>{document.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p>{new Date(document.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {!hasValidAnalysis && !hasAnalysisError && (
                  <div className="mt-3 p-2 bg-muted/50 border border-border/40 rounded-md">
                    <p className="text-xs text-muted-foreground">
                      Use the DeepSeek AI system in the header above to analyze this document.
                    </p>
                  </div>
                )}
                
                {hasAnalysisError && (
                  <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-xs text-destructive">
                      Analysis failed. Use the DeepSeek AI system above to retry.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Risk Assessment */}
          {hasValidAnalysis && document.analysis?.[0]?.content?.risks ? (
            <RiskAssessment 
              risks={document.analysis[0].content.risks as DocumentRisk[]}
              documentId={document.id}
              isLoading={false}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Run AI analysis to identify potential risks and compliance issues
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Deadline Manager */}
          <DeadlineManager 
            document={document}
            onDeadlineUpdated={onDeadlineUpdated}
          />
        </div>
      </ScrollArea>
    </div>
  );
};
