
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Zap,
  Shield,
  Users
} from 'lucide-react';
import { useEnhancedAnalysis } from '@/hooks/useEnhancedAnalysis';
import { EnhancedAnalysisResult } from '@/services/EnhancedDocumentAnalysis';
import { FormSpecificAnalysis } from '../DocumentAnalysis/FormSpecificAnalysis';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface EnhancedAnalysisPanelProps {
  documentId: string;
  documentTitle: string;
}

export const EnhancedAnalysisPanel: React.FC<EnhancedAnalysisPanelProps> = ({
  documentId,
  documentTitle
}) => {
  const {
    isAnalyzing,
    analysisResult,
    error,
    analyzeDocument,
    loadAnalysisResults
  } = useEnhancedAnalysis(documentId);

  const [showFormAnalysis, setShowFormAnalysis] = useState(false);

  useEffect(() => {
    // Load existing analysis results when component mounts
    loadAnalysisResults();
  }, [loadAnalysisResults]);

  const handleStartAnalysis = async () => {
    await analyzeDocument(documentId, {
      includeRiskAssessment: true,
      includeComplianceCheck: true,
      generateTasks: true
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Analysis Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-5 w-5 text-blue-500" />
              Enhanced BIA Analysis
            </CardTitle>
            {!analysisResult && (
              <Button
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                size="sm"
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <LoadingSpinner size="small" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Start Analysis
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        
        {isAnalyzing && (
          <CardContent>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <LoadingSpinner size="small" />
              <div>
                <p className="font-medium text-blue-900">DeepSeek AI Processing</p>
                <p className="text-sm text-blue-700">
                  Analyzing BIA compliance, extracting fields, and assessing risks...
                </p>
              </div>
            </div>
          </CardContent>
        )}

        {error && (
          <CardContent>
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-900">Analysis Failed</p>
                <p className="text-sm text-red-700">{error}</p>
                <Button
                  onClick={handleStartAnalysis}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Retry Analysis
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <>
          {/* Analysis Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Form Type</span>
                  </div>
                  <p className="text-sm">{analysisResult.formType}</p>
                  <Badge variant="outline">Form {analysisResult.formNumber}</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Confidence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{analysisResult.confidence}%</Badge>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${analysisResult.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Risk Assessment Summary */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Risk Assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getRiskColor(analysisResult.riskAssessment.overallRisk)}>
                    {getRiskIcon(analysisResult.riskAssessment.overallRisk)}
                    {analysisResult.riskAssessment.overallRisk.toUpperCase()} RISK
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {analysisResult.riskAssessment.riskFactors.length} issues identified
                  </span>
                </div>
              </div>

              {/* Compliance Status */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Compliance Status</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant={analysisResult.complianceStatus.biaCompliant ? 'default' : 'destructive'}>
                    BIA: {analysisResult.complianceStatus.biaCompliant ? 'Compliant' : 'Non-Compliant'}
                  </Badge>
                  <Badge variant={analysisResult.complianceStatus.osbCompliant ? 'default' : 'destructive'}>
                    OSB: {analysisResult.complianceStatus.osbCompliant ? 'Compliant' : 'Non-Compliant'}
                  </Badge>
                </div>
              </div>

              <Button
                onClick={() => setShowFormAnalysis(!showFormAnalysis)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {showFormAnalysis ? 'Hide' : 'Show'} Detailed Analysis
              </Button>
            </CardContent>
          </Card>

          {/* Detailed Form Analysis */}
          {showFormAnalysis && (
            <FormSpecificAnalysis analysis={analysisResult} />
          )}

          {/* Risk Factors */}
          {analysisResult.riskAssessment.riskFactors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResult.riskAssessment.riskFactors.map((risk, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getRiskColor(risk.severity)}>
                          {getRiskIcon(risk.severity)}
                          {risk.severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium text-sm">{risk.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{risk.description}</p>
                      {risk.recommendation && (
                        <p className="text-sm text-blue-600">
                          <strong>Recommendation:</strong> {risk.recommendation}
                        </p>
                      )}
                      {risk.biaReference && (
                        <p className="text-xs text-muted-foreground">
                          Reference: {risk.biaReference}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysisResult.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
