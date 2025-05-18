
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface Form31RiskViewProps {
  analysisData: any;
}

const Form31RiskView: React.FC<Form31RiskViewProps> = ({ analysisData }) => {
  if (!analysisData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Analysis Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Run document analysis to see risk assessment.</p>
        </CardContent>
      </Card>
    );
  }

  let risks: any[] = [];
  let formDetails: Record<string, any> = {};

  // Extract risks and form details from analysis data
  if (Array.isArray(analysisData)) {
    // If analysis data is an array, find the first item with risks
    const analysisWithRisks = analysisData.find(item => 
      item && typeof item === 'object' && item.content && item.content.risks
    );
    
    if (analysisWithRisks) {
      risks = analysisWithRisks.content.risks || [];
      formDetails = analysisWithRisks.content.extracted_info || {};
    }
  } else if (analysisData && typeof analysisData === 'object') {
    // If analysis data is an object, check if it has content property
    if (analysisData.content) {
      risks = analysisData.content.risks || [];
      formDetails = analysisData.content.extracted_info || {};
    } else if (analysisData.risks) {
      risks = analysisData.risks || [];
      formDetails = analysisData.extracted_info || {};
    }
  }

  // Sort risks by severity
  const sortedRisks = [...risks].sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity as keyof typeof severityOrder] - 
           severityOrder[b.severity as keyof typeof severityOrder];
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Form 31 Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Form Details */}
          <div className="space-y-2">
            <h3 className="font-medium">Form Details</h3>
            <ul className="space-y-1">
              {Object.entries(formDetails).map(([key, value]) => (
                <li key={key} className="text-sm">
                  <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> {value as React.ReactNode}
                </li>
              ))}
            </ul>
          </div>

          {/* Risk Items */}
          <div className="space-y-3">
            <h3 className="font-medium">Identified Risks</h3>
            {sortedRisks.length > 0 ? (
              sortedRisks.map((risk, index) => (
                <Alert 
                  key={index}
                  variant={risk.severity === 'high' ? 'destructive' : (risk.severity === 'medium' ? 'default' : 'outline')}
                  className="flex items-start"
                >
                  {risk.severity === 'high' ? (
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                  ) : risk.severity === 'medium' ? (
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                  ) : (
                    <Info className="h-4 w-4 mt-0.5" />
                  )}
                  <div className="ml-2">
                    <div className="flex items-center">
                      <AlertTitle>{risk.type}</AlertTitle>
                      <Badge 
                        className={`ml-2 ${
                          risk.severity === 'high' 
                            ? 'bg-destructive' 
                            : risk.severity === 'medium' 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                        }`}
                      >
                        {risk.severity}
                      </Badge>
                    </div>
                    <AlertDescription>{risk.description}</AlertDescription>
                    {risk.solution && (
                      <p className="mt-2 text-sm"><span className="font-medium">Recommendation:</span> {risk.solution}</p>
                    )}
                  </div>
                </Alert>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No risks detected for this document.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Form31RiskView;
