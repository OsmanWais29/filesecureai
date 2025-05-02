
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard, AlertCircle, ShieldAlert, ShieldCheck, CheckCircle,
  AlertTriangle, X, HelpCircle, FileCheck, FileText, Wallet, ReceiptText
} from "lucide-react";
import { VerificationStats } from "../types";

interface StatsSidebarProps {
  completionPercentage: number;
  stats: VerificationStats;
}

export const StatsSidebar: React.FC<StatsSidebarProps> = ({ completionPercentage, stats }) => {
  return (
    <div className="w-full sm:w-64 p-4 border-l border-gray-200 dark:border-gray-800 overflow-y-auto bg-muted/30">
      <div className="space-y-4">
        <Card className="border shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Directive 11R2 Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <p className="font-medium">Net Income</p>
                <p className="text-muted-foreground">$2,420.35</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-medium">Threshold</p>
                <p className="text-muted-foreground">$2,203.00</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-medium">Surplus</p>
                <p className="font-medium text-yellow-600">$217.35</p>
              </div>
              <div className="pt-1">
                <Progress value={completionPercentage} className="h-2 mb-2" />
                <p className="text-xs text-center">{completionPercentage}% Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-1">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                High Risk
              </span>
              <span className="text-xs text-muted-foreground">1</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                Medium Risk
              </span>
              <span className="text-xs text-muted-foreground">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                Low Risk
              </span>
              <span className="text-xs text-muted-foreground">3</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Verified
                </span>
                <span className="text-xs text-muted-foreground">{stats.verified}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Flagged
                </span>
                <span className="text-xs text-muted-foreground">{stats.flagged}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <X className="h-4 w-4 text-red-500" />
                  Missing
                </span>
                <span className="text-xs text-muted-foreground">{stats.missing}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              Help Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                BIA Guidelines
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Wallet className="h-4 w-4 mr-2" />
                Surplus Calculator
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ReceiptText className="h-4 w-4 mr-2" />
                Expense Standards
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
