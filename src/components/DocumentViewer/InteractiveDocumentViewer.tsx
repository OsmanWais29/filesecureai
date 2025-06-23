
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Highlight,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';
import { DocumentDetails } from './types';
import { toast } from 'sonner';

interface RiskHighlight {
  id: string;
  type: 'high' | 'medium' | 'low';
  description: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  regulation?: string;
  suggestion?: string;
}

interface InteractiveDocumentViewerProps {
  document: DocumentDetails;
  documentUrl?: string;
  onHighlightClick?: (highlight: RiskHighlight) => void;
  onAnnotationAdd?: (annotation: any) => void;
}

export const InteractiveDocumentViewer: React.FC<InteractiveDocumentViewerProps> = ({
  document,
  documentUrl,
  onHighlightClick,
  onAnnotationAdd
}) => {
  const [highlights, setHighlights] = useState<RiskHighlight[]>([]);
  const [showHighlights, setShowHighlights] = useState(true);
  const [selectedHighlight, setSelectedHighlight] = useState<RiskHighlight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Extract highlights from document analysis
  useEffect(() => {
    if (document.analysis && document.analysis.length > 0) {
      const analysisData = document.analysis[0];
      const risks = analysisData.content?.risks || [];
      
      // Convert risks to highlights with simulated positions
      const newHighlights: RiskHighlight[] = risks.map((risk: any, index: number) => ({
        id: `risk-${index}`,
        type: risk.severity || 'medium',
        description: risk.description || 'Risk identified',
        position: {
          x: 50 + (index * 30) % 300,
          y: 100 + (index * 50) % 400,
          width: 150,
          height: 20
        },
        regulation: risk.regulation,
        suggestion: risk.suggestion
      }));
      
      setHighlights(newHighlights);
    }
  }, [document.analysis]);

  const handleHighlightClick = useCallback((highlight: RiskHighlight) => {
    setSelectedHighlight(highlight);
    onHighlightClick?.(highlight);
    
    toast.info(`Risk: ${highlight.description}`, {
      description: highlight.suggestion || 'Click for more details',
      duration: 4000
    });
  }, [onHighlightClick]);

  const toggleHighlights = () => {
    setShowHighlights(!showHighlights);
    toast.info(showHighlights ? 'Highlights hidden' : 'Highlights shown');
  };

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    toast.info('Running AI analysis on document...', {
      description: 'Identifying risks and compliance issues'
    });
    
    // Simulate AI analysis
    setTimeout(() => {
      const newHighlight: RiskHighlight = {
        id: `ai-${Date.now()}`,
        type: 'high',
        description: 'Missing signature detected',
        position: {
          x: Math.random() * 300 + 50,
          y: Math.random() * 300 + 100,
          width: 180,
          height: 25
        },
        regulation: 'BIA Section 158',
        suggestion: 'Signature required for form completion'
      };
      
      setHighlights(prev => [...prev, newHighlight]);
      setIsAnalyzing(false);
      
      toast.success('AI analysis complete', {
        description: 'New risks identified and highlighted'
      });
    }, 2000);
  };

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'high': return <XCircle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getRiskColor = (type: string) => {
    switch (type) {
      case 'high': return 'bg-red-500/20 border-red-500 text-red-700';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500 text-yellow-700';
      case 'low': return 'bg-green-500/20 border-green-500 text-green-700';
      default: return 'bg-gray-500/20 border-gray-500 text-gray-700';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Interactive Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{document.title}</h3>
          <Badge variant="outline" className="gap-1">
            <Highlight className="h-3 w-3" />
            {highlights.length} Highlights
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleHighlights}
                  className="gap-1"
                >
                  {showHighlights ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {showHighlights ? 'Hide' : 'Show'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showHighlights ? 'Hide risk highlights' : 'Show risk highlights'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button
            variant="outline"
            size="sm"
            onClick={runAIAnalysis}
            disabled={isAnalyzing}
            className="gap-1"
          >
            <Zap className="h-4 w-4" />
            {isAnalyzing ? 'Analyzing...' : 'AI Scan'}
          </Button>
        </div>
      </div>

      {/* Document Viewer with Overlays */}
      <div className="flex-1 relative" ref={containerRef}>
        {/* Document Content */}
        <div className="w-full h-full relative">
          {documentUrl ? (
            <iframe
              ref={iframeRef}
              src={documentUrl}
              className="w-full h-full border-0"
              title={`Document: ${document.title}`}
              sandbox="allow-same-origin allow-scripts"
            />
          ) : (
            <div className="w-full h-full bg-muted/30 flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Document preview unavailable</p>
                <p className="text-sm text-muted-foreground">
                  Interactive highlights will appear when document loads
                </p>
              </div>
            </div>
          )}

          {/* Interactive Highlights Overlay */}
          {showHighlights && (
            <div className="absolute inset-0 pointer-events-none">
              {highlights.map((highlight) => (
                <TooltipProvider key={highlight.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`absolute border-2 cursor-pointer pointer-events-auto transition-all duration-200 hover:scale-105 ${getRiskColor(highlight.type)}`}
                        style={{
                          left: highlight.position.x,
                          top: highlight.position.y,
                          width: highlight.position.width,
                          height: highlight.position.height,
                        }}
                        onClick={() => handleHighlightClick(highlight)}
                      >
                        <div className="flex items-center gap-1 p-1">
                          {getRiskIcon(highlight.type)}
                          <span className="text-xs font-medium truncate">
                            {highlight.type.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium">{highlight.description}</p>
                        {highlight.regulation && (
                          <p className="text-xs text-muted-foreground">
                            Regulation: {highlight.regulation}
                          </p>
                        )}
                        {highlight.suggestion && (
                          <p className="text-xs">{highlight.suggestion}</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Highlight Details */}
      {selectedHighlight && (
        <Card className="m-4 border-l-4" style={{ borderLeftColor: selectedHighlight.type === 'high' ? '#ef4444' : selectedHighlight.type === 'medium' ? '#f59e0b' : '#10b981' }}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getRiskIcon(selectedHighlight.type)}
                  <span className="font-medium capitalize">{selectedHighlight.type} Risk</span>
                </div>
                <p className="text-sm">{selectedHighlight.description}</p>
                {selectedHighlight.regulation && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Regulation:</strong> {selectedHighlight.regulation}
                  </p>
                )}
                {selectedHighlight.suggestion && (
                  <p className="text-xs text-blue-600">
                    <strong>Suggestion:</strong> {selectedHighlight.suggestion}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedHighlight(null)}
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
