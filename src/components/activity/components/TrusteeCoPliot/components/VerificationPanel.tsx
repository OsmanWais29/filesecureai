
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  FileCheck, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  AlertCircle, 
  ShieldAlert, 
  FileText,
  ChevronRight
} from "lucide-react";
import { VerificationData, VerificationStatus, RiskLevel, IconType } from "../types";

interface VerificationPanelProps {
  verificationData: VerificationData;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({ verificationData }) => {
  // Helper function to get color based on status
  const getStatusColor = (status: VerificationStatus): string => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'flagged': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'missing': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'required': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Helper function to get risk level color
  const getRiskLevelColor = (level: RiskLevel): string => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Helper function to render progress color
  const getProgressColor = (score: number): string => {
    if (score < 40) return 'bg-red-500';
    if (score < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Helper function to render icon based on iconType
  const renderIcon = (iconType: IconType) => {
    switch (iconType) {
      case 'check-circle':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'alert-triangle':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'x':
        return <X className="h-5 w-5 text-red-500" />;
      case 'alert-circle':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Verification Overview Card */}
        <Card className="border shadow-sm bg-card animate-in fade-in duration-500">
          <CardHeader className="pb-2 space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="bg-primary/10 p-1 rounded">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
              Verification Overview
            </CardTitle>
            <CardDescription className="text-sm">
              {verificationData.stats.overallScore < 50 
                ? "Significant verification issues detected" 
                : verificationData.stats.overallScore < 80 
                  ? "Additional documentation may be required" 
                  : "Good progress, minor issues to address"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm mb-0.5">
                  <span>Verification Progress</span>
                  <span className="font-medium">{verificationData.stats.overallScore}%</span>
                </div>
                <Progress 
                  value={verificationData.stats.overallScore} 
                  className={`h-2 ${getProgressColor(verificationData.stats.overallScore)}`} 
                />
              </div>
              
              <div className="flex flex-wrap gap-3 pt-1">
                <Badge variant="outline" className="flex items-center gap-1 bg-green-100/50 text-green-800 border-green-200 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400">
                  <CheckCircle className="h-3 w-3" />
                  {verificationData.stats.verified} verified
                </Badge>
                
                <Badge variant="outline" className="flex items-center gap-1 bg-yellow-100/50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/30 dark:text-yellow-400">
                  <AlertTriangle className="h-3 w-3" />
                  {verificationData.stats.flagged} flagged
                </Badge>
                
                <Badge variant="outline" className="flex items-center gap-1 bg-red-100/50 text-red-800 border-red-200 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
                  <X className="h-3 w-3" />
                  {verificationData.stats.missing} missing
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Profile Card */}
        <Card className="border shadow-sm bg-card animate-in fade-in duration-500 delay-150">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="bg-primary/10 p-1 rounded">
                  <ShieldAlert className="h-5 w-5 text-primary" />
                </div>
                Risk Profile
              </CardTitle>
              <Badge className={`${getRiskLevelColor(verificationData.riskProfile.level)} font-medium`}>
                {verificationData.riskProfile.level.charAt(0).toUpperCase() + verificationData.riskProfile.level.slice(1)} Risk
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Primary Risk Factors
              </h4>
              <ul className="list-disc pl-5 space-y-1.5">
                {verificationData.riskProfile.primaryFactors.map((factor, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">{factor}</li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-100 dark:border-blue-900/30">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-blue-800 dark:text-blue-400">
                <CheckCircle className="h-4 w-4" />
                Recommendations
              </h4>
              <ul className="list-disc pl-5 space-y-1.5">
                {verificationData.riskProfile.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-blue-800 dark:text-blue-400/90">{rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        
        {/* Detailed Verification Sections */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground px-1 mb-2">Verification Details</h3>
          <Accordion type="multiple" defaultValue={["income"]} className="space-y-3">
            {verificationData.sections.map(section => (
              <AccordionItem key={section.id} value={section.id} className="border rounded-md overflow-hidden bg-card shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300">
                <AccordionTrigger className="text-base font-medium px-4 py-3 hover:no-underline hover:bg-muted/50">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3 pt-1">
                  <div className="space-y-3">
                    {section.items.map(item => (
                      <div 
                        key={item.id} 
                        className="flex items-start gap-3 p-3 rounded-md border border-border/50 bg-background hover:bg-muted/20 transition-colors"
                      >
                        <div className="mt-0.5">{renderIcon(item.iconType)}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-medium">{item.label}</h4>
                            <Badge className={`${getStatusColor(item.status)} text-xs font-medium`}>
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
      </div>
      
      {/* Sticky Action Button */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t p-4 w-full shadow-md">
        <Button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 transition-colors shadow-sm">
          <FileText className="h-4 w-4" />
          Request Trustee Review
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </ScrollArea>
  );
};
