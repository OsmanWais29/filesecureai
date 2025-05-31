
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DeepSeekAnalysisResponse } from '@/types/osb-analysis';
import { OSBFormValidator } from '@/utils/OSBFormValidator';
import { CheckCircle, AlertTriangle, XCircle, FileText, Users, Calendar } from 'lucide-react';

interface OSBAnalysisResultsProps {
  analysis: DeepSeekAnalysisResponse;
}

export const OSBAnalysisResults: React.FC<OSBAnalysisResultsProps> = ({ analysis }) => {
  const compliancePercentage = OSBFormValidator.getCompliancePercentage(analysis);
  const riskScore = OSBFormValidator.calculateRiskScore(analysis.comprehensive_risk_assessment.identified_risks);
  const riskFormat = OSBFormValidator.formatRiskLevel(analysis.comprehensive_risk_assessment.overall_risk_level);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-semibold">Form {analysis.document_details.form_number}</div>
                <div className="text-sm text-muted-foreground">{analysis.document_details.form_title}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`h-5 w-5 ${riskFormat.color}`}>
                {analysis.comprehensive_risk_assessment.overall_risk_level === 'high' ? <XCircle /> :
                 analysis.comprehensive_risk_assessment.overall_risk_level === 'medium' ? <AlertTriangle /> :
                 <CheckCircle />}
              </div>
              <div>
                <div className="font-semibold">{riskFormat.label}</div>
                <div className="text-sm text-muted-foreground">Score: {riskScore}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-semibold">{compliancePercentage}% Compliant</div>
                <div className="text-sm text-muted-foreground">
                  Confidence: {analysis.document_details.confidence_score}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Processing Status</label>
              <Badge variant={analysis.document_details.processing_status === 'complete' ? 'default' : 'secondary'}>
                {analysis.document_details.processing_status}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Pages Analyzed</label>
              <p className="font-medium">{analysis.document_details.pages_analyzed}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Extraction Quality</label>
              <Badge variant={analysis.document_details.extraction_quality === 'high' ? 'default' : 'secondary'}>
                {analysis.document_details.extraction_quality}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Document Type</label>
              <p className="font-medium">{analysis.document_details.document_type}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Details */}
      {(analysis.client_details.debtor_name || analysis.client_details.trustee_name || analysis.client_details.creditor_name) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.client_details.debtor_name && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Debtor Name</label>
                  <p className="font-medium">{analysis.client_details.debtor_name}</p>
                </div>
              )}
              {analysis.client_details.trustee_name && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Trustee Name</label>
                  <p className="font-medium">{analysis.client_details.trustee_name}</p>
                </div>
              )}
              {analysis.client_details.creditor_name && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Creditor Name</label>
                  <p className="font-medium">{analysis.client_details.creditor_name}</p>
                </div>
              )}
              {analysis.client_details.estate_number && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estate Number</label>
                  <p className="font-medium">{analysis.client_details.estate_number}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment */}
      {analysis.comprehensive_risk_assessment.identified_risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.comprehensive_risk_assessment.identified_risks.map((risk, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={risk.severity === 'high' ? 'destructive' : 
                                      risk.severity === 'medium' ? 'secondary' : 'outline'}>
                          {risk.severity} risk
                        </Badge>
                        <span className="text-sm text-muted-foreground">{risk.type}</span>
                      </div>
                      <p className="font-medium mb-2">{risk.description}</p>
                      <p className="text-sm text-muted-foreground mb-2">{risk.suggested_action}</p>
                      {risk.regulation_reference && (
                        <p className="text-sm font-medium text-blue-600">{risk.regulation_reference}</p>
                      )}
                    </div>
                    {risk.deadline_impact && (
                      <Badge variant="outline" className="ml-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        Deadline Impact
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Form Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Purpose</label>
            <p>{analysis.form_summary.purpose}</p>
          </div>
          {analysis.form_summary.filing_deadline && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Filing Deadline</label>
              <p className="font-medium text-red-600">{analysis.form_summary.filing_deadline}</p>
            </div>
          )}
          {analysis.form_summary.required_attachments.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Required Attachments</label>
              <ul className="list-disc list-inside text-sm">
                {analysis.form_summary.required_attachments.map((attachment, index) => (
                  <li key={index}>{attachment}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
