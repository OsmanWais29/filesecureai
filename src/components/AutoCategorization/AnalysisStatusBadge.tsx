
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import { AIDocumentAnalysisService } from '@/services/aiDocumentAnalysis';

interface AnalysisStatusBadgeProps {
  documentId: string;
  compact?: boolean;
}

export const AnalysisStatusBadge: React.FC<AnalysisStatusBadgeProps> = ({
  documentId,
  compact = false
}) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, [documentId]);

  const loadAnalysis = async () => {
    try {
      const result = await AIDocumentAnalysisService.getDocumentAnalysis(documentId);
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        {!compact && 'Loading...'}
      </Badge>
    );
  }

  if (!analysis) {
    return (
      <Badge variant="outline" className="gap-1">
        <Sparkles className="h-3 w-3" />
        {!compact && 'Not Analyzed'}
      </Badge>
    );
  }

  const getStatusConfig = () => {
    if (analysis.processing_status === 'completed') {
      const score = analysis.confidence_score || 0;
      if (score >= 0.8) {
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          text: compact ? 'High' : 'High Confidence',
          color: 'text-green-600'
        };
      } else if (score >= 0.6) {
        return {
          variant: 'secondary' as const,
          icon: AlertTriangle,
          text: compact ? 'Med' : 'Medium Confidence',
          color: 'text-yellow-600'
        };
      } else {
        return {
          variant: 'outline' as const,
          icon: XCircle,
          text: compact ? 'Low' : 'Low Confidence',
          color: 'text-red-600'
        };
      }
    }

    return {
      variant: 'secondary' as const,
      icon: Loader2,
      text: compact ? 'Processing' : 'Processing...',
      color: 'text-blue-600',
      animate: true
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon 
        className={`h-3 w-3 ${config.color} ${config.animate ? 'animate-spin' : ''}`} 
      />
      {config.text}
    </Badge>
  );
};
