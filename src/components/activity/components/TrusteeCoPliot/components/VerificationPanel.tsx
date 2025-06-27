
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentUploadSection } from "./DocumentUploadSection";
import { VerificationResults } from "./VerificationResults";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Upload, BarChart3 } from "lucide-react";

interface VerificationPanelProps {
  verificationData: {
    stats: {
      totalVerified: number;
      flaggedItems: number;
      confidenceScore: number;
    };
  };
}

export const VerificationPanel = ({ verificationData }: VerificationPanelProps) => {
  const [verificationResults, setVerificationResults] = useState([
    {
      category: "Employment Income",
      claimed: 4500,
      verified: 4200,
      status: 'discrepancy' as const,
      confidence: 85,
      notes: "Pay stub shows $4,200 vs claimed $4,500"
    },
    {
      category: "Rent/Mortgage",
      claimed: 1800,
      verified: 1800,
      status: 'match' as const,
      confidence: 95
    },
    {
      category: "Utilities",
      claimed: 250,
      verified: 420,
      status: 'flag' as const,
      confidence: 92,
      notes: "Bank statement shows $420 in utility payments"
    },
    {
      category: "Transportation",
      claimed: 300,
      verified: 285,
      status: 'match' as const,
      confidence: 88
    }
  ]);

  const handleDocumentUpload = (document: any) => {
    // In a real implementation, this would trigger analysis
    console.log('Document uploaded for verification:', document);
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="upload" className="flex flex-col h-full">
        <div className="px-3 pt-3 pb-1 border-b flex-shrink-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-1.5 text-xs">
              <Upload className="h-3 w-3" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-1.5 text-xs">
              <FileCheck className="h-3 w-3" />
              Results
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-1.5 text-xs">
              <BarChart3 className="h-3 w-3" />
              Summary
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="upload" className="h-full m-0 p-2">
            <DocumentUploadSection onDocumentUpload={handleDocumentUpload} />
          </TabsContent>

          <TabsContent value="results" className="h-full m-0 p-2 overflow-y-auto">
            <VerificationResults results={verificationResults} />
          </TabsContent>

          <TabsContent value="summary" className="h-full m-0 p-2 overflow-y-auto">
            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Verification Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 border rounded-md">
                      <p className="text-2xl font-bold text-green-600">
                        {verificationResults.filter(r => r.status === 'match').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Verified Items</p>
                    </div>
                    <div className="text-center p-3 border rounded-md">
                      <p className="text-2xl font-bold text-red-600">
                        {verificationResults.filter(r => r.status === 'flag').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Flagged Items</p>
                    </div>
                  </div>
                  
                  <div className="text-center p-3 border rounded-md">
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(verificationResults.reduce((acc, item) => acc + item.confidence, 0) / verificationResults.length)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Average Confidence</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Recommendations</h4>
                    <div className="space-y-1">
                      {verificationResults.filter(r => r.status === 'flag').length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          Request additional documentation for flagged items
                        </Badge>
                      )}
                      {verificationResults.filter(r => r.status === 'discrepancy').length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Schedule follow-up for discrepancies
                        </Badge>
                      )}
                      {verificationResults.filter(r => r.status === 'match').length === verificationResults.length && (
                        <Badge variant="default" className="text-xs">
                          All documents verified - ready for approval
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
