
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, TrendingDown } from "lucide-react";

interface VerificationItem {
  category: string;
  claimed: number;
  verified: number;
  status: 'match' | 'discrepancy' | 'flag';
  confidence: number;
  notes?: string;
}

interface VerificationResultsProps {
  results: VerificationItem[];
}

export const VerificationResults = ({ results }: VerificationResultsProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'match':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'discrepancy':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'flag':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      match: { variant: 'default' as const, text: 'Verified' },
      discrepancy: { variant: 'secondary' as const, text: 'Review Needed' },
      flag: { variant: 'destructive' as const, text: 'Flagged' }
    };
    
    const { variant, text } = config[status as keyof typeof config] || config.match;
    return <Badge variant={variant} className="text-xs">{text}</Badge>;
  };

  const getDifferenceIcon = (claimed: number, verified: number) => {
    if (verified > claimed) {
      return <TrendingUp className="h-3 w-3 text-red-500" />;
    } else if (verified < claimed) {
      return <TrendingDown className="h-3 w-3 text-green-500" />;
    }
    return null;
  };

  const flaggedItems = results.filter(r => r.status === 'flag');
  const discrepancyItems = results.filter(r => r.status === 'discrepancy');

  return (
    <div className="space-y-4">
      {flaggedItems.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            {flaggedItems.length} item(s) flagged for immediate review. Significant discrepancies detected.
          </AlertDescription>
        </Alert>
      )}

      {discrepancyItems.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {discrepancyItems.length} item(s) require review. Minor discrepancies found.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Verification Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <p className="text-sm font-medium">{item.category}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Claimed: ${item.claimed.toLocaleString()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        Verified: ${item.verified.toLocaleString()}
                        {getDifferenceIcon(item.claimed, item.verified)}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(item.status)}
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.confidence}% confidence
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
