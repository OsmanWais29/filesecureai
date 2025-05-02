
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileCheck, ArrowRight, CheckCircle, AlertTriangle, X, FileText, ShieldAlert } from "lucide-react";
import { VerificationData, VerificationStatus, RiskLevel } from "../types";

interface VerificationPanelProps {
  verificationData: VerificationData;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({ verificationData }) => {
  // Helper function to get color based on status
  const getStatusColor = (status: VerificationStatus): string => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'flagged': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'missing': return 'bg-red-100 text-red-800';
      case 'required': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get risk level color
  const getRiskLevelColor = (level: RiskLevel): string => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Verification Overview Card */}
        <Card className="border shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Verification Overview
            </CardTitle>
            <CardDescription>
              {verificationData.stats.overallScore < 50 
                ? "Significant verification issues detected" 
                : verificationData.stats.overallScore < 80 
                  ? "Additional documentation may be required" 
                  : "Good progress, minor issues to address"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={verificationData.stats.overallScore} className="h-2 mb-2" />
            <div className="text-sm text-muted-foreground flex justify-between">
              <span>{verificationData.stats.overallScore}% verified</span>
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {verificationData.stats.verified} verified
                </span>
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                  {verificationData.stats.flagged} flagged
                </span>
                <span className="flex items-center gap-1">
                  <X className="h-3 w-3 text-red-500" />
                  {verificationData.stats.missing} missing
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Profile Card */}
        <Card className="border shadow-sm bg-card">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                Risk Profile
              </CardTitle>
              <Badge className={getRiskLevelColor(verificationData.riskProfile.level)}>
                {verificationData.riskProfile.level.charAt(0).toUpperCase() + verificationData.riskProfile.level.slice(1)} Risk
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Primary Risk Factors</h4>
              <ul className="list-disc pl-5 space-y-1">
                {verificationData.riskProfile.primaryFactors.map((factor, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">{factor}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Recommendations</h4>
              <ul className="list-disc pl-5 space-y-1">
                {verificationData.riskProfile.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">{rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        
        {/* Detailed Verification Sections */}
        <Accordion type="multiple" defaultValue={["income"]} className="space-y-3">
          {verificationData.sections.map(section => (
            <AccordionItem key={section.id} value={section.id} className="border rounded-md overflow-hidden bg-card">
              <AccordionTrigger className="text-base font-medium px-4 py-3 hover:no-underline hover:bg-muted/50">
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-1">
                <div className="space-y-2">
                  {section.items.map(item => (
                    <div key={item.id} className="flex items-start gap-3 p-2 rounded-md border border-gray-200 bg-background">
                      <div className="mt-0.5">{item.icon}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <h4 className="font-medium">{item.label}</h4>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      
      {/* Sticky Action Button */}
      <div className="sticky bottom-0 bg-background border-t p-4 w-full">
        <Button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90">
          <FileText className="h-4 w-4 mr-2" />
          Request Trustee Review
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </ScrollArea>
  );
};
