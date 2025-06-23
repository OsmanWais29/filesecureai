
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Zap,
  Shield,
  Target,
  BookOpen
} from 'lucide-react';
import { EnhancedDocumentAnalysis, EnhancedAnalysisResult } from '@/services/EnhancedDocumentAnalysis';
import { toast } from 'sonner';

interface EnhancedAnalysisDashboardProps {
  documentId: string;
  onAnalysisComplete?: (result: EnhancedAnalysisResult) => void;
}

export const EnhancedAnalysisDashboard: React.FC<EnhancedAnalysisDashboardProps> = ({
  documentId,
  onAnalysisComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EnhancedAnalysisResult | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadExistingAnalysis();
  }, [documentId]);

  const loadExistingAnalysis = async () => {
    const result = await EnhancedDocumentAnalysis.getAnalysisResults(documentId);
    if (result) {
      setAnalysisResult(result);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await EnhancedDocumentAnalysis.analyzeDocument(documentId, {
        includeRiskAssessment: true,
        includeComplianceCheck: true,
        generateTasks: true
      });
      
      if (result) {
        setAnalysisResult(result);
        onAnalysisComplete?.(result);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getComplianceStatus = () => {
    if (!analysisResult) return null;
    const { complianceStatus } = analysisResult;
    
    if (complianceStatus.biaCompliant && complianceStatus.osbCompliant) {
      return { status: 'compliant', color: 'text-green-600', icon: CheckCircle };
    } else if (complianceStatus.biaCompliant || complianceStatus.osbCompliant) {
      return { status: 'partial', color: 'text-yellow-600', icon: AlertTriangle };
    } else {
      return { status: 'non-compliant', color: 'text-red-600', icon: AlertTriangle };
    }
  };

  const complianceInfo = getComplianceStatus();

  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            Enhanced DeepSeek Document Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {analysisResult && (
                <>
                  <Badge variant="outline" className="font-mono">
                    {analysisResult.formType} - {analysisResult.formNumber}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">
                      {analysisResult.confidence}% Confidence
                    </span>
                  </div>
                </>
              )}
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze with DeepSeek AI'}
            </Button>
          </div>
          
          {isAnalyzing && (
            <div className="mt-4 space-y-2">
              <Progress value={75} className="w-full" />
              <p className="text-sm text-muted-foreground">
                DeepSeek AI processing document for BIA compliance...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {analysisResult && (
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="recommendations">Actions</TabsTrigger>
            <TabsTrigger value="reasoning">AI Reasoning</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Document Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{analysisResult.formType}</p>
                  <p className="text-sm text-muted-foreground">Form {analysisResult.formNumber}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Risk Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={getRiskColor(analysisResult.riskAssessment.overallRisk)} className="text-lg">
                    {analysisResult.riskAssessment.overallRisk.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {complianceInfo && (
                    <div className={`flex items-center gap-2 ${complianceInfo.color}`}>
                      <complianceInfo.icon className="h-5 w-5" />
                      <span className="font-medium">{complianceInfo.status}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {analysisResult.riskAssessment.criticalIssues.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Critical Issues Detected:</strong>
                  <ul className="mt-2 list-disc list-inside">
                    {analysisResult.riskAssessment.criticalIssues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            <div className="grid gap-4">
              {analysisResult.riskAssessment.riskFactors.map((risk, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{risk.type}</CardTitle>
                      <Badge variant={getRiskColor(risk.severity)}>
                        {risk.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">{risk.description}</p>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Recommendation:</p>
                      <p className="text-sm text-blue-800">{risk.recommendation}</p>
                    </div>
                    {risk.biaReference && (
                      <Badge variant="outline" className="text-xs">
                        {risk.biaReference}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>BIA Compliance Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {analysisResult.complianceStatus.biaCompliant ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {analysisResult.complianceStatus.biaCompliant ? 'Compliant' : 'Non-Compliant'}
                    </span>
                  </div>
                  
                  {analysisResult.complianceStatus.missingFields.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Missing Fields:</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {analysisResult.complianceStatus.missingFields.map((field, index) => (
                          <li key={index}>{field}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>OSB Compliance Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {analysisResult.complianceStatus.osbCompliant ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {analysisResult.complianceStatus.osbCompliant ? 'Compliant' : 'Non-Compliant'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid gap-4">
              {analysisResult.recommendations.map((recommendation, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reasoning" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  DeepSeek AI Reasoning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {analysisResult.deepseekReasoning}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
