
import { CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Risk } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskItem } from "./RiskItem";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Form31RiskViewProps {
  risks: Risk[];
  documentId: string;
}

export const Form31RiskView: React.FC<Form31RiskViewProps> = ({ risks, documentId }) => {
  const [localRisks, setLocalRisks] = useState<Risk[]>(risks || []);
  const [loading, setLoading] = useState(false);

  // If no risks were passed in, try to load them from the database
  useEffect(() => {
    if (!risks || risks.length === 0) {
      setLoading(true);
      
      const fetchRisks = async () => {
        try {
          const { data: document } = await supabase
            .from('documents')
            .select(`
              id,
              analysis:document_analysis(content)
            `)
            .eq('id', documentId)
            .single();
            
          if (document?.analysis?.[0]?.content?.risks) {
            setLocalRisks(document.analysis[0].content.risks);
          }
        } catch (error) {
          console.error('Error fetching risks:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchRisks();
    }
  }, [risks, documentId]);

  // Count risks by severity
  const criticalCount = localRisks?.filter(r => r.severity === 'high').length || 0;
  const moderateCount = localRisks?.filter(r => r.severity === 'medium').length || 0;
  const minorCount = localRisks?.filter(r => r.severity === 'low').length || 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2 text-sm text-muted-foreground">Loading risk assessment...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-3">
        {criticalCount > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {criticalCount} Critical
          </Badge>
        )}
        {moderateCount > 0 && (
          <Badge variant="default" className="bg-amber-500 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {moderateCount} Moderate
          </Badge>
        )}
        {minorCount > 0 && (
          <Badge variant="outline" className="text-yellow-600 flex items-center gap-1">
            <Info className="h-3 w-3" />
            {minorCount} Minor
          </Badge>
        )}
        {localRisks?.length === 0 && (
          <Badge variant="outline" className="text-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Claim Verified
          </Badge>
        )}
      </div>

      {localRisks.length > 0 ? (
        <div className="space-y-3">
          {localRisks.map((risk, index) => (
            <RiskItem key={`risk-${index}`} risk={risk} documentId={documentId} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-center space-x-2 mb-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <p className="font-medium">Claim Appears Complete</p>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              This proof of claim appears to be properly completed with all required information.
              No immediate issues were detected in the claim validation process.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
