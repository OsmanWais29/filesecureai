
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Users, 
  DollarSign, 
  Clock, 
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { EnhancedAnalysisResult } from '@/services/EnhancedDocumentAnalysis';

interface FormSpecificAnalysisProps {
  analysis: EnhancedAnalysisResult;
}

export const FormSpecificAnalysis: React.FC<FormSpecificAnalysisProps> = ({ analysis }) => {
  const renderForm47Analysis = () => {
    const fields = analysis.extractedFields;
    
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Consumer Proposal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Debtor Name</label>
                <p className="font-medium">{fields.debtor_name || 'Not extracted'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Proposal Administrator</label>
                <p className="font-medium">{fields.administrator_name || 'Not extracted'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Debt</label>
                <p className="font-medium">{fields.total_debt || 'Not extracted'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Proposal Amount</label>
                <p className="font-medium">{fields.proposal_amount || 'Not extracted'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Payment Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fields.payment_schedule ? (
              <div className="space-y-2">
                <p><strong>Payment Amount:</strong> {fields.payment_schedule.amount}</p>
                <p><strong>Frequency:</strong> {fields.payment_schedule.frequency}</p>
                <p><strong>Duration:</strong> {fields.payment_schedule.duration}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Payment schedule not extracted</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderForm31Analysis = () => {
    const fields = analysis.extractedFields;
    
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Proof of Claim Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Creditor Name</label>
                <p className="font-medium">{fields.creditor_name || 'Not extracted'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Claim Amount</label>
                <p className="font-medium">{fields.claim_amount || 'Not extracted'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Claim Type</label>
                <p className="font-medium">{fields.claim_type || 'Not extracted'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Security</label>
                <p className="font-medium">{fields.security_details || 'None specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderForm65Analysis = () => {
    const fields = analysis.extractedFields;
    
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Assignment in Bankruptcy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Debtor Name</label>
                <p className="font-medium">{fields.debtor_name || 'Not extracted'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Trustee</label>
                <p className="font-medium">{fields.trustee_name || 'Not extracted'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Assignment Date</label>
                <p className="font-medium">{fields.assignment_date || 'Not extracted'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cause of Bankruptcy</label>
                <p className="font-medium">{fields.bankruptcy_cause || 'Not extracted'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderGenericAnalysis = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Extracted Fields
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(analysis.extractedFields).map(([key, value]) => (
            <div key={key}>
              <label className="text-sm font-medium text-muted-foreground capitalize">
                {key.replace(/_/g, ' ')}
              </label>
              <p className="font-medium">{String(value) || 'Not extracted'}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const getFormSpecificContent = () => {
    switch (analysis.formNumber) {
      case '47':
        return renderForm47Analysis();
      case '31':
        return renderForm31Analysis();
      case '65':
        return renderForm65Analysis();
      default:
        return renderGenericAnalysis();
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Form {analysis.formNumber} - {analysis.formType}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Confidence: {analysis.confidence}%
              </Badge>
              <Progress value={analysis.confidence} className="w-24" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Form-Specific Content */}
      {getFormSpecificContent()}

      {/* Processing Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.processingSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                {step.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : step.status === 'failed' ? (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-500" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{step.step}</p>
                  <p className="text-xs text-muted-foreground">{step.details}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {step.confidence}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
