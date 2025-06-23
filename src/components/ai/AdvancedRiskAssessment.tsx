
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Brain, 
  CheckCircle,
  Clock,
  FileText,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface RiskFactor {
  id: string;
  type: 'compliance' | 'financial' | 'operational' | 'legal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  likelihood: number;
  impact: number;
  riskScore: number;
  mitigation: string[];
  deadline?: string;
}

interface PredictiveInsight {
  category: string;
  prediction: string;
  confidence: number;
  timeline: string;
  recommendations: string[];
}

export const AdvancedRiskAssessment = ({ documentId }: { documentId?: string }) => {
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [overallRiskScore, setOverallRiskScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    performAdvancedRiskAnalysis();
  }, [documentId]);

  const performAdvancedRiskAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate advanced AI risk analysis
    setTimeout(() => {
      const mockRiskFactors: RiskFactor[] = [
        {
          id: 'rf1',
          type: 'compliance',
          severity: 'high',
          description: 'BIA Section 178 - Statement of Affairs incomplete',
          likelihood: 85,
          impact: 90,
          riskScore: 76.5,
          mitigation: ['Complete missing fields', 'Review with client', 'Submit amendment'],
          deadline: '2025-01-15'
        },
        {
          id: 'rf2',
          type: 'financial',
          severity: 'medium',
          description: 'Surplus income calculation anomaly detected',
          likelihood: 60,
          impact: 75,
          riskScore: 45,
          mitigation: ['Verify income documentation', 'Recalculate thresholds']
        },
        {
          id: 'rf3',
          type: 'operational',
          severity: 'low',
          description: 'Document versioning inconsistency',
          likelihood: 30,
          impact: 40,
          riskScore: 12,
          mitigation: ['Update version control', 'Standardize naming']
        }
      ];

      const mockInsights: PredictiveInsight[] = [
        {
          category: 'Case Outcome',
          prediction: '92% likelihood of successful discharge within 9 months',
          confidence: 92,
          timeline: '9 months',
          recommendations: ['Maintain current payment schedule', 'Monitor surplus income']
        },
        {
          category: 'Compliance Risk',
          prediction: 'Low risk of OSB audit based on filing patterns',
          confidence: 78,
          timeline: 'Next 12 months',
          recommendations: ['Continue current documentation standards']
        }
      ];

      setRiskFactors(mockRiskFactors);
      setPredictiveInsights(mockInsights);
      setOverallRiskScore(44); // Calculated from risk factors
      setIsAnalyzing(false);
    }, 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            AI Risk Analysis in Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={66} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Analyzing compliance patterns, financial data, and risk indicators...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Advanced Risk Assessment
            </div>
            <Badge variant="outline">AI-Powered</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`text-4xl font-bold ${getRiskScoreColor(overallRiskScore)}`}>
              {overallRiskScore}/100
            </div>
            <div className="text-sm text-muted-foreground">
              Overall Risk Score
            </div>
            <Progress value={overallRiskScore} className="w-full" />
            <Button onClick={performAdvancedRiskAnalysis} variant="outline" size="sm">
              <Brain className="h-4 w-4 mr-2" />
              Re-analyze with AI
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Identified Risk Factors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {riskFactors.map((risk) => (
            <Alert key={risk.id}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{risk.description}</span>
                    <Badge variant={getSeverityColor(risk.severity)}>
                      {risk.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Risk Score: {risk.riskScore} | Likelihood: {risk.likelihood}% | Impact: {risk.impact}%
                  </div>
                  {risk.deadline && (
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      Deadline: {risk.deadline}
                    </div>
                  )}
                  <div className="mt-2">
                    <p className="text-xs font-medium">Recommended Actions:</p>
                    <ul className="text-xs list-disc list-inside space-y-1">
                      {risk.mitigation.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Predictive Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            AI Predictive Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {predictiveInsights.map((insight, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{insight.category}</h4>
                <Badge variant="secondary">{insight.confidence}% confidence</Badge>
              </div>
              <p className="text-sm">{insight.prediction}</p>
              <div className="text-xs text-muted-foreground">
                Timeline: {insight.timeline}
              </div>
              <div>
                <p className="text-xs font-medium">AI Recommendations:</p>
                <ul className="text-xs list-disc list-inside space-y-1">
                  {insight.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
