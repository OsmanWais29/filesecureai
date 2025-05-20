
import { FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { DocumentDetails, Risk } from "./types";
import { DeadlineManager } from "./DeadlineManager";
import { toRecord, toString } from "@/utils/typeSafetyUtils";

interface AnalysisPanelProps {
  document: DocumentDetails;
  onDeadlineUpdated: () => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ document, onDeadlineUpdated }) => {
  const analysisContent = document.analysis?.[0]?.content;
  // Safely convert to record to avoid "unknown" type errors
  const extractedInfo = analysisContent?.extracted_info ? toRecord(analysisContent.extracted_info) : {};
  // Safely convert to array to avoid "unknown" array operations
  const risks = Array.isArray(analysisContent?.risks) ? analysisContent?.risks : [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Determine form type for specialized display, using toString for type safety
  const formType = toString(extractedInfo.type) || toString(extractedInfo.formType) || document.type;
  const isForm31 = formType?.includes('form-31') || formType?.includes('proof-of-claim') || (toString(extractedInfo.formNumber) === '31');
  const isForm47 = formType?.includes('form-47') || formType?.includes('consumer-proposal') || (toString(extractedInfo.formNumber) === '47');

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-2 rounded-md bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{document.title}</h2>
          <p className="text-sm text-muted-foreground">
            {isForm31 ? 'Form 31 - Proof of Claim' : 
             isForm47 ? 'Form 47 - Consumer Proposal' : 
             document.type}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-md bg-muted">
          <h3 className="font-medium mb-2">Document Details</h3>
          <div className="space-y-2 text-sm">
            {/* Generic fields */}
            <div>
              <span className="text-muted-foreground">Client Name:</span>
              <p>{toString(extractedInfo.clientName) || toString(extractedInfo.debtorName) || 'Not extracted'}</p>
            </div>

            {/* Form 31 specific fields */}
            {isForm31 && (
              <>
                <div>
                  <span className="text-muted-foreground">Creditor Name:</span>
                  <p>{toString(extractedInfo.claimantName) || toString(extractedInfo.creditorName) || 'Not extracted'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Claim Amount:</span>
                  <p>{toString(extractedInfo.claimAmount) || 'Not extracted'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Claim Type:</span>
                  <p>{toString(extractedInfo.claimType) || toString(extractedInfo.claimClassification) || 'Not extracted'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Security Details:</span>
                  <p>{toString(extractedInfo.securityDetails) || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Creditor Address:</span>
                  <p>{toString(extractedInfo.creditorAddress) || 'Not extracted'}</p>
                </div>
              </>
            )}

            {/* Form 47 specific fields */}
            {isForm47 && (
              <>
                <div>
                  <span className="text-muted-foreground">Trustee Name:</span>
                  <p>{toString(extractedInfo.trusteeName) || 'Not extracted'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Administrator:</span>
                  <p>{toString(extractedInfo.administratorName) || toString(extractedInfo.trusteeName) || 'Not extracted'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Proposal Type:</span>
                  <p>{toString(extractedInfo.proposalType) || 'Consumer Proposal'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Monthly Payment:</span>
                  <p>{toString(extractedInfo.monthlyPayment) || 'Not specified'}</p>
                </div>
              </>
            )}

            {/* Common fields for all forms */}
            <div>
              <span className="text-muted-foreground">Date Signed:</span>
              <p>{toString(extractedInfo.dateSigned) || 'Not extracted'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Form Number:</span>
              <p>{toString(extractedInfo.formNumber) || (isForm31 ? '31' : isForm47 ? '47' : 'Not extracted')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Estate Number:</span>
              <p>{toString(extractedInfo.estateNumber) || 'Not extracted'}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-md bg-muted">
          <h3 className="font-medium mb-2">Risk Assessment</h3>
          <div className="space-y-2">
            {risks.length > 0 ? (
              risks.map((risk: Risk, index: number) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  {risk.severity === 'high' ? (
                    <AlertTriangle className={`h-4 w-4 ${getSeverityColor(risk.severity)} mt-0.5`} />
                  ) : (
                    <CheckCircle className={`h-4 w-4 ${getSeverityColor(risk.severity)} mt-0.5`} />
                  )}
                  <div>
                    <p className="font-medium">{risk.type}</p>
                    <p className="text-muted-foreground text-xs">{risk.description}</p>
                    {risk.solution && (
                      <p className="text-xs mt-1 italic">Solution: {risk.solution}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <p>Analysis in progress or no risks identified yet. This document may need manual review.</p>
              </div>
            )}
          </div>
        </div>

        <DeadlineManager 
          document={document}
          onDeadlineUpdated={onDeadlineUpdated}
        />
      </div>
    </div>
  );
};
