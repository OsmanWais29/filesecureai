
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle } from 'lucide-react';
import { RiskFactor, ColorCodedRiskDisplayProps } from './RiskDisplay/RiskDisplayTypes';
import { RiskItemComponent } from './RiskDisplay/RiskItemComponent';
import { getRiskColor, getRiskIcon } from './RiskDisplay/RiskUtilities';

export const ColorCodedRiskDisplay = ({ 
  risks, 
  overallRisk, 
  onJumpToField,
  onViewBIAReference,
  onCreateTask 
}: ColorCodedRiskDisplayProps) => {
  const [expandedRisks, setExpandedRisks] = useState<Set<number>>(new Set());

  const toggleRiskExpansion = (index: number) => {
    const newExpanded = new Set(expandedRisks);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRisks(newExpanded);
  };

  const getOverallRiskDisplay = () => {
    const colors = {
      high: 'bg-red-100 border-red-200 text-red-800',
      medium: 'bg-yellow-100 border-yellow-200 text-yellow-800',
      low: 'bg-green-100 border-green-200 text-green-800'
    };

    const OverallRiskIcon = getRiskIcon(overallRisk);

    return (
      <Alert className={colors[overallRisk]}>
        <OverallRiskIcon className={`h-4 w-4 ${
          overallRisk === 'high' 
            ? 'text-red-500' 
            : overallRisk === 'medium'
            ? 'text-yellow-500'
            : 'text-green-500'
        }`} />
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
            <RiskItemComponent
              key={index}
              risk={risk}
              index={index}
              isExpanded={expandedRisks.has(index)}
              onToggleExpansion={toggleRiskExpansion}
              onJumpToField={onJumpToField}
              onViewBIAReference={onViewBIAReference}
              onCreateTask={onCreateTask}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
