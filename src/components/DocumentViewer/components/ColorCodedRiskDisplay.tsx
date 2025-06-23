
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  ExternalLink, 
  FileText,
  Clock,
  User,
  MapPin
} from 'lucide-react';

interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
  biaReference: string;
  fieldLocation: string;
  deadline?: string;
  assignedTo?: string;
}

interface ColorCodedRiskDisplayProps {
  risks: RiskFactor[];
  overallRisk: 'low' | 'medium' | 'high';
  onJumpToField?: (fieldLocation: string) => void;
  onViewBIAReference?: (reference: string) => void;
  onCreateTask?: (risk: RiskFactor) => void;
}

export const ColorCodedRiskDisplay = ({ 
  risks, 
  overallRisk, 
  onJumpToField,
  onViewBIAReference,
  onCreateTask 
}: ColorCodedRiskDisplayProps) => {
  const [expandedRisks, setExpandedRisks] = useState<Set<number>>(new Set());

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getRiskIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getOverallRiskDisplay = () => {
    const colors = {
      high: 'bg-red-100 border-red-200 text-red-800',
      medium: 'bg-yellow-100 border-yellow-200 text-yellow-800',
      low: 'bg-green-100 border-green-200 text-green-800'
    };

    return (
      <Alert className={colors[overallRisk]}>
        {getRiskIcon(overallRisk)}
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <strong>Overall Risk Level: {overallRisk.toUpperCase()}</strong>
              <div className="text-sm mt-1">
                {risks.length} risk factor{risks.length !== 1 ? 's' : ''} identified
                {risks.filter(r => r.severity === 'high').length > 0 && 
                  ` (${risks.filter(r => r.severity === 'high').length} high priority)`
                }
              </div>
            </div>
            <Badge variant={getRiskColor(overallRisk)} className="ml-2">
              {overallRisk.toUpperCase()}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  const toggleRiskExpansion = (index: number) => {
    const newExpanded = new Set(expandedRisks);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRisks(newExpanded);
  };

  if (risks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Risk Assessment Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-800">
              No significant risks detected in this document. All fields appear complete and compliant.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Risk Assessment Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {getOverallRiskDisplay()}
        
        <div className="space-y-3">
          {risks.map((risk, index) => (
            <div 
              key={index}
              className={`p-4 border rounded-lg transition-all ${
                risk.severity === 'high' 
                  ? 'border-red-200 bg-red-50' 
                  : risk.severity === 'medium'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-green-200 bg-green-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getRiskIcon(risk.severity)}
                    <h4 className="font-medium text-sm">{risk.type}</h4>
                    <Badge variant={getRiskColor(risk.severity)}>
                      {risk.severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {risk.description}
                  </p>

                  {expandedRisks.has(index) && (
                    <div className="space-y-3 pt-3 border-t border-gray-200">
                      <div>
                        <span className="text-sm font-medium">Recommendation:</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          {risk.recommendation}
                        </p>
                      </div>
                      
                      {risk.biaReference && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">BIA Reference:</span>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-blue-600"
                            onClick={() => onViewBIAReference?.(risk.biaReference)}
                          >
                            {risk.biaReference}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      )}
                      
                      {risk.fieldLocation && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Field Location:</span>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-blue-600"
                            onClick={() => onJumpToField?.(risk.fieldLocation)}
                          >
                            {risk.fieldLocation}
                          </Button>
                        </div>
                      )}
                      
                      {risk.deadline && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Deadline:</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(risk.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {risk.assignedTo && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Assigned to:</span>
                          <span className="text-sm text-muted-foreground">
                            {risk.assignedTo}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRiskExpansion(index)}
                    className="text-xs"
                  >
                    {expandedRisks.has(index) ? 'Less' : 'More'}
                  </Button>
                  
                  {onCreateTask && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCreateTask(risk)}
                      className="text-xs"
                    >
                      Create Task
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
